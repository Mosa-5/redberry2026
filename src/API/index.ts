import axios, { type AxiosError, type CreateAxiosDefaults } from "axios";

import { waitForLogin } from "./reauth";
import { getToken, setToken } from "./token";

declare module "axios" {
  interface AxiosRequestConfig {
    /**
     * false: a 401 only signs out, without the login modal or a replay. For
     * calls where a 401 means something else (login), the docs say to fall
     * back to guest (/me), or nobody is waiting on the result (logout,
     * releasing a hold on close).
     */
    reauth?: boolean;
    /** Set on the replay, so a second 401 doesn't ask again. */
    replayed?: boolean;
  }
}

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

// A 401 means the token is expired or revoked: drop it, open the login
// modal, and once the user is back replay the request with the new token,
// so the action they started finishes without a second click (the brief
// and the API docs). If they close the modal, the 401 reaches the caller.
httpClient.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config;
  if (error.response?.status !== 401 || !config) return Promise.reject(error);

  setToken(null);
  if (config.reauth === false || config.replayed) return Promise.reject(error);

  if (await waitForLogin()) return httpClient({ ...config, replayed: true });
  return Promise.reject(error);
});
