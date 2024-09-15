"use client";
import Header from "@/components/header";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  faBroom,
  faExclamationTriangle,
  faMagnifyingGlass,
  faMicrophoneLines,
  faRotateLeft,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import axios from "axios";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";

function ChatDialog({
  message,
  isUser,
  isClearMemory,
  isThinking,
}: {
  message: string;
  isUser: boolean;
  isClearMemory?: boolean;
  isThinking?: boolean;
}) {
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div>
        <div
          className={`flex items-center mb-2 ${
            isUser ? "flex-row-reverse" : ""
          }`}
        >
          <div
            className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
              isUser ? "bg-[#B09687]" : "border bg-white"
            }`}
          >
            {isUser ? (
              <FontAwesomeIcon
                icon={faUser}
                className="text-white sm:text-2xl"
              />
            ) : (
              <Image
                src="/assets/xiaozhi.png"
                width={1000}
                height={1000}
                alt="avatar"
                draggable="false"
                loading="lazy"
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
              />
            )}
          </div>
          <p className="text-gray-500 text-sm sm:text-xl mx-4">
            {isUser ? "您" : "AI小智"}
          </p>
        </div>

        <div
          className={`px-4 min-h-10 whitespace-pre-wrap break-words py-2 sm:py-2.5 sm:px-5 rounded-3xl mx-8 ${
            isUser
              ? "rounded-tr-lg bg-[#FDE3D4]"
              : "rounded-tl-lg bg-gray-50 border border-gray-200"
          }`}
        >
          <Markdown
            className={`prose break-words prose-sm sm:prose-lg text-gray-800 ${
              isThinking ? "is-thinking" : ""
            }`}
          >
            {isClearMemory ? "记忆已清除" : message}
          </Markdown>
        </div>
      </div>
    </div>
  );
}

function Suggestions({ onChange }: { onChange: (suggestion: string) => void }) {
  const suggestions = [
    "产后抑郁症有哪些现象？",
    "怀孕初期有哪些症状？",
    "母乳喂养好还是奶粉喂养好？",
    "孕晚期失眠怎么办？",
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full my-8">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          className="bg-white rounded-full py-3 text-sm sm:text-base md:text-lg px-6 text-gray-500 shadow-lg flex items-center justify-between"
          onClick={() => {
            onChange(suggestion);
          }}
        >
          <p className="inline-block">{suggestion}</p>
          <FontAwesomeIcon icon={faMagnifyingGlass} className="w-5 h-5" />
        </button>
      ))}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex justify-center py-8 flex-col items-center">
      <div className="animate-spin rounded-full h-10 w-10 sm:h-16 sm:w-16 border-b-2 border-[#B09687]" />
      <p className="text-gray-500 text-sm sm:text-lg my-4">
        AI小智正在思考中...
      </p>
    </div>
  );
}

function ErrorBox({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex justify-center py-8 flex-col items-center">
      <FontAwesomeIcon
        icon={faExclamationTriangle}
        className="text-red-500 text-5xl"
      />
      <p className="text-red-500 text-sm sm:text-lg my-4">{error}</p>
      <button
        className="rounded-full border-red-500 border py-2 px-6 text-red-500 text-sm sm:text-lg"
        onClick={(e) => {
          e.preventDefault();
          onRetry();
        }}
      >
        <FontAwesomeIcon icon={faRotateLeft} className="mr-2" />
        重试
      </button>
    </div>
  );
}

interface Message {
  message: string;
  isUser: boolean;
  isClear: boolean;
}

type SpeechRecognition =
  // @ts-ignore
  | typeof window.SpeechRecognition
  // @ts-ignore
  | typeof window.webkitSpeechRecognition;

function Chat() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { authToken } = useAuth();
  const currentQuestionRef = useRef("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [chatId, setChatId] = useState(0);
  const [currentAns, setCurrentAns] = useState("");
  const currentAnsRef = useRef("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [needClear, setNeedClear] = useState(false);
  const handleClearMemory = () => {
    setMessages([...messages, { message: "", isUser: false, isClear: true }]);

    // Refresh
    if (authToken) {
      axios({
        url: `${process.env.NEXT_PUBLIC_API_URL}/chat/create`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
        .then((v) => {
          if (v.status == 200) {
            setChatId(v.data["data"]["chatId"]);
            console.log(v.data["data"]["chatId"]);
          }
        })
        .catch((e) => {
          setError(true);
          setErrorMessage(e.message);
        });
    }
  };

  useEffect(() => {
    let count = 0;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (!messages[i].isClear) {
        count += 1;
      } else {
        break;
      }
    }
    setNeedClear(count > 0);
  }, [messages]);

  useEffect(() => {
    if (authToken) {
      axios({
        url: `${process.env.NEXT_PUBLIC_API_URL}/chat/create`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
        .then((v) => {
          if (v.status == 200) {
            setChatId(v.data["data"]["chatId"]);
          }
        })
        .catch((e) => {
          setError(true);
          setErrorMessage(e.message);
        });
    }
  }, [authToken]);

  function handleQuestion() {
    if (!inputRef.current) {
      return;
    }

    // 设置状态
    setLoading(true);

    const message = inputRef.current.value;

    currentQuestionRef.current = message;

    // 清空对话框
    inputRef.current.value = "";

    fetchEventSource(`${process.env.NEXT_PUBLIC_API_URL}/chat/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId,
        query: message,
      }),
      async onopen() {
        setCurrentAns("");
        currentAnsRef.current = "";
      },
      onmessage(m) {
        setLoading(false);
        setIsTyping(true);
        setCurrentAns((ans) => ans + m.data);
        currentAnsRef.current += m.data;
      },
      onclose() {
        setIsTyping(false);
        // 添加用户对话
        setMessages((prevMessages) => [
          ...prevMessages,
          { message, isUser: true, isClear: false },
        ]);
        // 添加会话
        setMessages((prevMessages) => [
          ...prevMessages,
          { message: currentAnsRef.current, isUser: false, isClear: false },
        ]);
      },
      onerror(err) {
        setIsTyping(false);
        setLoading(false);
        setError(err);
      },
    });
  }

  useEffect(() => {
    // 检查浏览器是否支持 Web Speech API
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        // @ts-ignore
        (window as any).webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = "zh-CN"; // 设置语言为中文
      recognition.interimResults = false; // 禁用中间结果
      recognition.maxAlternatives = 1; // 返回一个最佳匹配的结果

      // @ts-ignore
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcriptResult = event.results[0][0].transcript;
        console.log("Transcript:", transcriptResult); // 输出到控制台
        console.log(inputRef.current);
        if (inputRef.current) {
          inputRef.current.value = transcriptResult;
          console.log(inputRef.current.value);
        }
      };
      // @ts-ignore
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
      };

      recognitionRef.current = recognition;
    } else {
      console.error("Web Speech API not supported in this browser.");
    }
  }, []);

  const handleMouseDown = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const handleMouseUp = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return (
    <>
      {messages.length > 0 &&
        messages.map((message, index) => (
          <ChatDialog
            key={index}
            message={message.message}
            isUser={message.isUser}
            isClearMemory={message.isClear}
          />
        ))}

      {isTyping && <ChatDialog message={currentAns} isUser={false} />}

      {loading && <Loading />}
      {error && (
        <ErrorBox
          error={errorMessage}
          onRetry={() => {
            if (inputRef.current) {
              inputRef.current.value = currentQuestionRef.current;
              setError(false);
              handleQuestion();
            }
          }}
        />
      )}
      <div className="rounded-full bg-white py-2 px-2 sm:px-4 shadow-2xl my-4 md:my-8 lg:my-16 flex-row flex w-full">
        <button
          className="rounded-full bg-[#B09687] py-2 px-4 sm:px-6 md:px-8 text-white text-sm sm:text-base md:text-xl md:tracking-widest text-nowrap disabled:opacity-50"
          disabled={loading || isTyping || !authToken}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <FontAwesomeIcon icon={faMicrophoneLines} className="sm:mr-2" />
        </button>
        <input
          type="text"
          ref={inputRef}
          placeholder="请输入您的问题"
          className="flex-1 sm:h-12 px-4 mx-1 sm:mx-4 text-sm sm:text-base md:text-lg disabled:opacity-50"
          disabled={loading || isTyping}
          maxLength={100}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              handleQuestion();
            }
          }}
        />
        <button
          className="rounded-full bg-[#B09687] py-2 px-4 sm:px-6 md:px-8 text-white text-sm sm:text-base md:text-xl md:tracking-widest text-nowrap disabled:opacity-50"
          disabled={loading || isTyping || !authToken}
          onClick={(e) => {
            e.preventDefault();
            handleQuestion();
          }}
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} className="sm:mr-2" /> 搜索
        </button>
        {needClear && (
          <button
            className="rounded-full bg-[#afa8a3] p-2 text-white text-sm sm:text-base md:text-xl md:tracking-widest text-nowrap disabled:opacity-50 ml-2"
            disabled={loading || isTyping}
            onClick={(e) => {
              e.preventDefault();
              handleClearMemory();
            }}
          >
            <FontAwesomeIcon icon={faBroom} className="w-8" />
          </button>
        )}
      </div>

      <Suggestions
        onChange={(suggestion: string) => {
          if (inputRef?.current) {
            inputRef.current.value = suggestion;
          }
        }}
      />
    </>
  );
}

export default function ChatPage() {
  return (
    <div className="relative overflow-hidden">
      <Header />
      <Image
        src="/assets/xuancao.png"
        width={1000}
        height={1000}
        alt="decorative"
        draggable={false}
        loading="lazy"
        className="hidden md:block opacity-80 absolute -left-[10vw] -top-1/4 w-[160vw] h-[300vh] transform rotate-[-32.57deg] z-[-2]"
      />
      <Image
        src="/assets/xuancao.png"
        width={1000}
        height={1000}
        alt="decorative"
        draggable="false"
        loading="lazy"
        className="md:hidden opacity-80 absolute top-[10vh] w-[80vw] h-[100vh] transform rotate-[-32.57deg] z-[-2]"
      />

      <Image
        src="/assets/decoration-path.png"
        width={1000}
        height={1000}
        alt="decorative"
        className="absolute right-0 -bottom-0 -my-32 w-[50vw] h-[100vh] transform z-[-2]"
      />

      <div className="absolute bg-gradient-to-b from-[#FEF4EB]/[0.5] to-transparent to-60% w-full h-full z-[-1]" />
      <div className="absolute bg-gradient-to-b from-60% from-transparent to-[#FEF4EB]/[0.75] w-full h-full z-[-1]" />

      <div className="flex flex-col items-center max-w-6xl mx-auto py-8 md:py-14 px-4 sm:px-8 md:px-16">
        <Image
          src="/assets/title.png"
          width={1000}
          height={1000}
          alt="decorative"
          draggable="false"
          loading="lazy"
          className="w-[40rem] my-8"
        />

        <div className="relative">
          <Image
            src="/assets/xuancao-normal.png"
            width={1000}
            height={1000}
            alt="decorative"
            draggable="false"
            loading="lazy"
            className="-top-1/2 right-[calc(50%-8rem)] absolute opacity-40 rotate-[11.26deg] z-[-2] w-[16rem]"
          />
          <p className="text-gray-700 sm:text-lg indent-10 tracking-wide !leading-10 md:!leading-[3rem] lg:!leading-[4rem]">
            作为你的专属智能健康助手，我可以回答你一切有关孕产期母婴健康的问题。
            请放心，我们的对话将是私密的。
          </p>

          <Chat />
        </div>
      </div>
    </div>
  );
}
