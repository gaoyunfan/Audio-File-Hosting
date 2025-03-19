"use server";
import { cookies } from "next/headers";
import { RegisterFormData, SessionData, User } from "../schemas";
import { getIronSession, IronSessionData } from "iron-session";
import { redirect } from "next/navigation";
import { access } from "fs";

declare module "iron-session" {
  interface IronSessionData extends SessionData {
    user?: User;
  }
}

const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const sessionOptions = {
  password: process.env.IRON_SESSION_SECRET!,
  cookieName: "user-session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
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
  await storeUserSession(user);
  return { success: true, message: message, user: user };
}

export async function handleLogin(formValues: {
  username: string;
  password: string;
  password2: string;
}) {
  const result = await fetchData("auth/login/", formValues);
  console.log("login result", result);
  if (!result.success) return result;

  const { access, refresh, user, message } = result.data;
  await storeTokens(access, refresh);
  await storeUserSession(user);

  return { success: true, message: message, user: user };
}

export async function handleLogout() {
  const cookieSotre = await cookies();
  const refreshToken = cookieSotre.get("refreshToken")?.value;
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
    destroyUserSession();
    return { success: true, message: "Logged out successfully" };
  } catch {
    return { success: false, message: "Failed to logout" };
  }
}
export async function refreshAccessToken() {
  const cookieStore = await cookies();
  try {
    const refreshToken = cookieStore.get("refreshToken")?.value;
    console.log("refreshToken", refreshToken);
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

    storeTokens(newAccessToken, newRefreshToken);
  } catch (error) {
    console.error("Failed to refresh access token", error);
    await destroyUserSession();
    return { success: false, message: "Failed to refresh access token" };
  }

  return { success: true, message: "Access token refreshed" };
}

const storeUserSession = async (user: User) => {
  const cookieStore = await cookies();
  const session = await getIronSession<IronSessionData>(
    cookieStore,
    sessionOptions
  );
  session.user = { ...user };
  await session.save();
};

const destroyUserSession = async () => {
  const cookieStore = await cookies();
  const session = await getIronSession<IronSessionData>(
    cookieStore,
    sessionOptions
  );
  session.destroy();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
};

export const getUserFromSession = async () => {
  const cookieStore = await cookies();
  const session = await getIronSession<IronSessionData>(
    cookieStore,
    sessionOptions
  );
  if (!session.user) return null;
  return session.user;
};

export async function updateUserSession(updatedUser: User) {
  const cookieStore = await cookies();
  const session = await getIronSession<IronSessionData>(
    cookieStore,
    sessionOptions
  );

  session.user = updatedUser;

  await session.save();

  return { success: true, message: "User session updated successfully" };
}

const storeTokens = async (
  access_token: string,
  refresh_token: string | null
) => {
  const cookieStore = await cookies();
  cookieStore.set("accessToken", JSON.stringify(access_token), {
    httpOnly: true,
    sameSite: "lax",
  });
  if (refresh_token) {
    cookieStore.set("refreshToken", JSON.stringify(refresh_token), {
      httpOnly: true,
      sameSite: "lax",
    });
  }
};
