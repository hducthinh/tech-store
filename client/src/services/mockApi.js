// src/services/mockApi.js

const USERS_KEY = "mock_users";
const SESSIONS_KEY = "mock_sessions";

const loadJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const createError = (status, message) => {
  const error = new Error(message);
  error.response = { status, data: { message } };
  return error;
};

const getTokenFromDefaults = (api) => {
  const authHeader = api?.defaults?.headers?.common?.Authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return localStorage.getItem("token");
};

const getUserByToken = (token) => {
  if (!token) return null;
  const sessions = loadJson(SESSIONS_KEY, {});
  const userId = sessions[token];
  if (!userId) return null;
  const users = loadJson(USERS_KEY, []);
  return users.find((u) => u.id === userId) || null;
};

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

const createMockApi = () => {
  const api = {
    defaults: {
      headers: {
        common: {},
      },
    },
  };

  api.post = async (url, payload = {}) => {
    if (url === "/auth/register") {
      const fullName = String(payload.fullName || "").trim();
      const email = normalizeEmail(payload.email);
      const phone = String(payload.phone || "").trim();
      const password = String(payload.password || "");
      const confirmPassword = String(payload.confirmPassword || "");

      if (!fullName || !email || !phone || !password) {
        throw createError(400, "Vui long nhap day du thong tin.");
      }

      if (password !== confirmPassword) {
        throw createError(400, "Mat khau xac nhan khong khop.");
      }

      const users = loadJson(USERS_KEY, []);
      const exists = users.some((u) => u.email === email);
      if (exists) {
        throw createError(409, "Email da ton tai.");
      }

      const id = `u_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const user = { id, fullName, email, phone };
      users.push({ ...user, password });
      saveJson(USERS_KEY, users);

      const token = `mock_${id}_${Date.now()}`;
      const sessions = loadJson(SESSIONS_KEY, {});
      sessions[token] = id;
      saveJson(SESSIONS_KEY, sessions);

      return { data: { data: { token, user } } };
    }

    if (url === "/auth/login") {
      const email = normalizeEmail(payload.email);
      const password = String(payload.password || "");

      if (!email || !password) {
        throw createError(400, "Vui long nhap email va mat khau.");
      }

      const users = loadJson(USERS_KEY, []);
      const match = users.find((u) => u.email === email);
      if (!match || match.password !== password) {
        throw createError(401, "Sai email hoac mat khau.");
      }

      const token = `mock_${match.id}_${Date.now()}`;
      const sessions = loadJson(SESSIONS_KEY, {});
      sessions[token] = match.id;
      saveJson(SESSIONS_KEY, sessions);

      const user = {
        id: match.id,
        fullName: match.fullName,
        email: match.email,
        phone: match.phone,
      };

      return { data: { data: { token, user } } };
    }

    throw createError(404, "Mock API chua ho tro endpoint nay.");
  };

  api.get = async (url) => {
    if (url === "/auth/profile") {
      const token = getTokenFromDefaults(api);
      const user = getUserByToken(token);
      if (!user) {
        throw createError(401, "Token khong hop le.");
      }

      return { data: { data: { user } } };
    }

    throw createError(404, "Mock API chua ho tro endpoint nay.");
  };

  return api;
};

export default createMockApi;
