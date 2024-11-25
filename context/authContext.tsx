"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  role: string | null;
  setRole: (role: string | null) => void;
  user: any;
  setUser: (user: any) => void;
  status: "loading" | "login" | "logout";
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<"loading" | "login" | "logout">(
    "loading"
  );
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchUserData = async (token: string, role: string) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      let endpoint = "";
      switch (role) {
        case "user":
          endpoint = "/api/auth/user";
          break;
        case "instructor":
          endpoint = "/api/auth/instructor";
          break;
        case "admin":
          endpoint = "/api/auth/admin";
          break;
        default:
          return;
      }

      const response = await axios.get(endpoint, config);
      setUser(response.data.data);
      setStatus("login");
    } catch (error) {
      console.error("Error fetching user data:", error);
      setToken(null);
      setRole(null);
      setUser(null);
      setStatus("logout");
    }
  };

  const logout = () => {
    setStatus("logout");
    Cookies.remove("session_token");
    Cookies.remove("session_role");
    setToken(null);
    setRole(null);
    setUser(null);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      const storedToken = Cookies.get("session_token");
      const storedRole = Cookies.get("session_role");

      if (storedToken && storedRole) {
        setToken(storedToken);
        setRole(storedRole);
        fetchUserData(storedToken, storedRole);
      } else {
        setStatus("logout");
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (typeof window !== "undefined" && isInitialized) {
      if (token && role) {
        Cookies.set("session_token", token, { expires: 3 });
        Cookies.set("session_role", role, { expires: 3 });
        fetchUserData(token, role);
      }
    }
  }, [token, role, isInitialized]);

  return (
    <AuthContext.Provider
      value={{ token, setToken, role, setRole, user, setUser, status, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
