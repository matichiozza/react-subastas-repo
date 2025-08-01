import React, { createContext, useState, useEffect } from "react";
import API_BASE_URL from "../config/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Obtener datos del usuario autenticado
  const fetchUser = async (jwt) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      if (!response.ok) {
        setUser(null);
        setLoading(false);
        return;
      }
      const data = await response.json();
      setUser(data);
      setLoading(false);
    } catch (error) {
      setUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Nuevo login: hace petición al backend
  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) return false;
      const data = await response.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        await fetchUser(data.token);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // Nueva función para registrar usuario
  const register = async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) return false;
      const data = await response.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        await fetchUser(data.token);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
