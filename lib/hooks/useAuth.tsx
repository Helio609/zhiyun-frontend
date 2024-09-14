"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  authToken: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const localAuthToken = localStorage.getItem("authToken");
    if (localAuthToken) {
      setAuthToken(localAuthToken);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem("authToken", token);
    setAuthToken(token);
  };

  const logout = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }).then(async (v) => {
      console.log(await v.json());
    });
    localStorage.removeItem("authToken");
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
