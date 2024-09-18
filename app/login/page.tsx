"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useRef } from "react";

export default function LoginPage() {
  const { authToken, login } = useAuth();
  const router = useRouter();
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  if (authToken) {
    router.replace("/");
  }

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const username = usernameRef?.current?.value;
    const password = passwordRef?.current?.value;

    if (!username || !password) return;
    console.log(username);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify({
        userName: username,
        password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (v) => {
      if (v.status != 200) {
        // TODO
        return;
      }

      const response = await v.json();
      login(response["data"]["accessToken"]);
    });
  };

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    const username = usernameRef?.current?.value;
    const password = passwordRef?.current?.value;

    if (!username || !password) return;
    console.log(username);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: "POST",
      body: JSON.stringify({
        avatar: "",
        email: "",
        nickName: username,
        password: password,
        phone: "",
        qq: "",
        sex: "男",
        userName: username,
        wx: "",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (v) => {
      if (v.status != 200) {
        // TODO
        return;
      }

      // 注册成功直接触发登录流程
      handleLogin(e);
    });
  };

  return (
    <div className="relative overflow-hidden">
      <header>
        <div className="absolute p-2 flex text-orange-300 w-full">
          <a href="/" className="underline">
            首页
          </a>
        </div>
      </header>
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

          <form onSubmit={(e) => handleLogin(e)}>
            <div className="rounded-full bg-white py-2 px-2 sm:px-4 shadow-2xl my-4 md:my-8 lg:my-16 flex-row flex w-full">
              <input
                ref={usernameRef}
                name="username"
                type="text"
                placeholder="账号"
                className="flex-1 sm:h-12 px-4 mx-1 sm:mx-4 text-sm sm:text-base md:text-lg disabled:opacity-50"
              />
            </div>
            <div className="rounded-full bg-white py-2 px-2 sm:px-4 shadow-2xl my-4 md:my-8 lg:my-16 flex-row flex w-full">
              <input
                ref={passwordRef}
                name="password"
                type="password"
                placeholder="密码"
                className="flex-1 sm:h-12 px-4 mx-1 sm:mx-4 text-sm sm:text-base md:text-lg disabled:opacity-50"
              />
            </div>
            <div className="flex w-full justify-between">
              <button
                onClick={handleLogin}
                className="rounded-full bg-[#B09687] py-2 px-4 sm:px-6 md:px-8 text-white text-sm sm:text-base md:text-xl md:tracking-widest text-nowrap disabled:opacity-50"
              >
                登录
              </button>

              <button
                onClick={handleRegister}
                className="rounded-full bg-[#84766e] py-2 px-4 sm:px-6 md:px-8 text-white text-sm sm:text-base md:text-xl md:tracking-widest text-nowrap disabled:opacity-50"
              >
                注册
              </button>
            </div>
          </form>
          <p className="text-gray-700 sm:text-lg indent-10 tracking-wide !leading-10 md:!leading-[3rem] lg:!leading-[4rem]">
            作为你的专属智能健康助手，我可以回答你一切有关孕产期母婴健康的问题。
            请放心，我们的对话将是私密的。
          </p>
        </div>
      </div>
    </div>
  );
}
