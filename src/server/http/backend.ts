import { getOutgoingCookieHeader } from "./cookies";

const getBackendUrl = () => {
  const url = process.env.BACKEND_URL;
  if (!url) {
    throw new Error("Url is not set");
  }
  return url.replace(/\/$/, "");
};

export const backendFetch = async (url: string, init: RequestInit) => {
  return fetch(`${getBackendUrl()}${url}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
};

export const authenticatedBackendFetch = async (url: string, init: RequestInit = {}) => {
  return backendFetch(url, {
    ...init,
    headers: { ...init.headers, cookie: await getOutgoingCookieHeader() },
  });
};
