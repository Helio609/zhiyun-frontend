"use client";

import { useAuth } from "@/lib/hooks/useAuth";

export default function Header() {
  const { authToken, logout } = useAuth();

  return (
    <header>
      <div className="absolute p-2 flex text-orange-300 w-full justify-end">
        {!authToken && (
          <a href="/login" className="underline">
            请登录
          </a>
        )}
        {authToken && (
          <div
            className="underline"
            onClick={() => {
              logout();
            }}
          >
            退出
          </div>
        )}
      </div>
    </header>
  );
}
