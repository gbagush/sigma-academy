"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  role: string | null;
  setRole: (role: string | null) => void;
  user: any; // Tipe data user sesuai response API
  setUser: (user: any) => void;
  status: "loading" | "login" | "logout"; // Status otentikasi tanpa null
  logout: () => void; // Fungsi logout
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
  ); // Set default status to loading

  const fetchUserData = async (token: string, role: string) => {
    try {
      setStatus("loading"); // Set status ke loading saat mem-fetch data
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
      setStatus("login"); // Set status ke login setelah berhasil
    } catch (error) {
      console.error("Error fetching user data:", error);
      setToken(null);
      setRole(null);
      setUser(null);
      setStatus("logout"); // Reset status ke logout jika terjadi error
    }
  };

  const logout = () => {
    setStatus("logout"); // Set status ke logout
    localStorage.removeItem("session_token");
    localStorage.removeItem("session_role");
    setToken(null);
    setRole(null);
    setUser(null);
    // Anda bisa menambahkan navigasi ke halaman login di sini jika perlu
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("session_token");
      const storedRole = localStorage.getItem("session_role");

      if (storedToken) {
        setToken(storedToken);
      } else {
        setStatus("logout");
      }

      if (storedRole) {
        setRole(storedRole);
      } else {
        setStatus("logout");
      }

      if (storedToken && storedRole) {
        fetchUserData(storedToken, storedRole);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("session_token", token);
        fetchUserData(token, role!); // Ensure role is not null when calling this function
      } else {
        localStorage.removeItem("session_token");
      }

      if (role) {
        localStorage.setItem("session_role", role);
      } else {
        localStorage.removeItem("session_role");
      }
    }
  }, [token, role]);

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
