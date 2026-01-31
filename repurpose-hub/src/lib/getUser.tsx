import Cookies from "js-cookie";

export const getCookie = () => {
  const cookie = Cookies.get("user");
  return cookie ? JSON.parse(cookie) : null;
};

export const getAccessToken = () => {
  return Cookies.get("access_token") || null;
};

export const getRefreshToken = () => {
  return Cookies.get("refresh_token") || null;
};

export const deleteCookie = async () => {
  await Cookies.remove("user");
  await Cookies.remove("access_token");
  await Cookies.remove("refresh_token");
};

export const setAuthCookies = (accessToken: string, refreshToken: string, user: object) => {
  Cookies.set("access_token", accessToken, { expires: 3, secure: true, sameSite: "Strict" });
  Cookies.set("refresh_token", refreshToken, { expires: 7, secure: true, sameSite: "Strict" });
  Cookies.set("user", JSON.stringify(user), { expires: 3, secure: true, sameSite: "Strict" });
};

export const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch("http://localhost:8000/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      Cookies.set("access_token", data.access_token, { expires: 3, secure: true, sameSite: "Strict" });
      Cookies.set("refresh_token", data.refresh_token, { expires: 7, secure: true, sameSite: "Strict" });
      return true;
    }
    return false;
  } catch (e) {
    console.error("Token refresh failed:", e);
    return false;
  }
};

export const user = getCookie();
