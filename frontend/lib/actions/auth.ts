"use server";
import { cookies } from "next/headers";
import { RegisterFormData, SessionData, SessionUser, User } from "../schemas";
import { getIronSession, IronSessionData } from "iron-session";
import { revalidatePath } from "next/cache";
import jwt from "jsonwebtoken";

declare module "iron-session" {
  interface IronSessionData extends SessionData {
    user?: SessionUser;
  }
}

const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const sessionOptions = {
  password: process.env.IRON_SESSION_SECRET!,
  cookieName: "user-session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as "lax",
  },
};

async function fetchData(endpoint: string, body: object) {
  try {
    const response = await fetch(`${USER_SERVICE_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || data.message || "Request failed");

    return { success: true, data };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Request failed";
    return { success: false, message: errorMessage };
  }
}

export async function handleRegister(formData: RegisterFormData) {
  const result = await fetchData("auth/register/", formData);
  console.log("register result", result);
  if (!result.success) return result;

  const { access, refresh, user, message } = result.data;
  await storeTokens(access, refresh);
  const decodedToken = jwt.decode(access);
  const isAdmin = extractAdminFlag(decodedToken);
  await storeUserSession(user, isAdmin);
  return { success: true, message: message, user: user };
}

export async function handleLogin(formData: FormData) {
  const formValues = Object.fromEntries(formData);
  const result = await fetchData("auth/login/", formValues);
  console.log("login result", result);
  if (!result.success) return result;

  const { access, refresh, user, message } = result.data;
  await storeTokens(access, refresh);
  const decodedToken = jwt.decode(access);
  const isAdmin = extractAdminFlag(decodedToken);
  console.log(`user: ${user}, isAdmin: ${isAdmin}`);
  await storeUserSession(user, isAdmin);

  return { success: true, message: message, user: user };
}

function extractAdminFlag(decodedToken: string | jwt.JwtPayload | null) {
  return decodedToken &&
    typeof decodedToken === "object" &&
    "isAdmin" in decodedToken
    ? decodedToken.isAdmin
    : false;
}

export async function handleLogout() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  try {
    const res = await fetch(`${USER_SERVICE_URL}/auth/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.log("log out errorData", errorData);
      throw new Error("Failed to logout");
    }
    const session = await getUserSession();
    session.destroy();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");

    return { success: true, message: "Logged out successfully" };
  } catch {
    return { success: false, message: "Failed to logout" };
  }
}
export async function refreshAccessToken() {
  console.log("refresh access token at:", new Date().toLocaleTimeString());
  const cookieStore = await cookies();
  try {
    let refreshToken = cookieStore.get("refreshToken")?.value;
    const res = await fetch(`${USER_SERVICE_URL}/auth/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const responseData = await res.json();
    if (!res.ok) {
      throw new Error(responseData.message || "Failed to refresh access token");
    }
    const newAccessToken = responseData.access;
    const newRefreshToken = responseData.refresh ?? null;
    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
    });
    if (newRefreshToken) {
      cookieStore.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        sameSite: "lax",
      });
    }
    const decodedToken = jwt.decode(newAccessToken);
    const isAdmin = extractAdminFlag(decodedToken);
    const session = await getUserSession();
    session.user = { ...session.user, isAdmin: isAdmin } as SessionUser;
    await session.save();
    return { success: true, message: "Access token refreshed" };
  } catch (error) {
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    const session = await getUserSession();
    session.destroy();
    console.error("Failed to refresh access token", error);
    return { success: false, message: "Failed to refresh access token" };
  }
}

const storeUserSession = async (user: User, isAdmin: boolean) => {
  const session = await getUserSession();
  session.user = { ...user, isAdmin: isAdmin };
  await session.save();
};

export const getUserFromSession = async () => {
  const session = await getUserSession();
  if (!session || !session.user) return null;
  return session.user;
};

export async function updateUserSession(updatedUser: User, isAdmin: boolean) {
  const session = await getUserSession();
  session.user = { ...updatedUser, isAdmin: isAdmin };

  await session.save();

  return { success: true, message: "User session updated successfully" };
}

export async function callValidatePath(path: string) {
  revalidatePath(path);
}

const storeTokens = async (
  access_token: string,
  refresh_token: string | null
) => {
  "use server";
  const cookieStore = await cookies();
  cookieStore.set("accessToken", access_token, {
    httpOnly: true,
    sameSite: "lax",
  });
  if (refresh_token) {
    cookieStore.set("refreshToken", refresh_token, {
      httpOnly: true,
      sameSite: "lax",
    });
  }
};

export const getUserSession = async () => {
  const cookieStore = await cookies();
  const session = await getIronSession<IronSessionData>(
    cookieStore,
    sessionOptions
  );
  return session;
};
