import Cookies from "js-cookie";

export const getCookie = () => {
  const cookie = Cookies.get("user");
  return cookie ? JSON.parse(cookie) : null;
};

export const deleteCookie = async () => {
  await Cookies.remove("user");
};

export const user = getCookie();
