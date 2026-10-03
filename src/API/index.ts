import axios, { type AxiosError, type CreateAxiosDefaults } from "axios";

import { getToken, setToken } from "./token";

const axiosConfig: CreateAxiosDefaults = {
  baseURL: import.meta.env.VITE_BASE_URL,
};

export const httpClient = axios.create(axiosConfig);

// Every request carries the token when there is one. Public endpoints
// ignore it, so there's no need to decide per call.
httpClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A 401 from /login means wrong credentials — the modal handles that. From
// anywhere else it means the token is expired or revoked, so drop it and
// the app falls back to guest. The error still propagates for the caller.
httpClient.interceptors.response.use(undefined, (error: AxiosError) => {
  if (error.response?.status === 401 && error.config?.url !== "/login") {
    setToken(null);
  }
  return Promise.reject(error);
});
