/* eslint-disable react-refresh/only-export-components */
// src/contexts/AuthContext.jsx
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false); // 👈 Thêm state này

  const getErrorMessage = (err) =>
    err?.response?.data?.message || err?.message || "Có lỗi xảy ra.";

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get("/auth/profile");
      setUser(response.data.data.user);
    } catch (_err) {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
    } finally {
      setIsInitialized(true); // 👈 Đánh dấu đã khởi tạo xong
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await fetchProfile();
      } else {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [fetchProfile]);

  const register = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/register", payload);
      const token = response?.data?.token || response?.data?.data?.token;
      const userPayload =
        response?.data?.data?.user || response?.data?.user || null;

      if (token) {
        localStorage.setItem("token", token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      if (userPayload) {
        setUser(userPayload);
      }

      return { success: true, data: response.data };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (payload) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.post("/auth/login", payload);
        const token = response?.data?.token || response?.data?.data?.token;
        const userPayload =
          response?.data?.data?.user || response?.data?.user || null;

        if (token) {
          localStorage.setItem("token", token);
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        if (userPayload) {
          setUser(userPayload);
        } else if (token) {
          await fetchProfile();
        }

        return { success: true, data: response.data };
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchProfile],
  );

  const updateProfile = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.put("/auth/profile", payload);
      const userPayload = response?.data?.data?.user;
      if (userPayload) {
        setUser(userPayload);
      } else {
        await fetchProfile();
      }
      return { success: true, data: response.data };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, isInitialized, register, login, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
