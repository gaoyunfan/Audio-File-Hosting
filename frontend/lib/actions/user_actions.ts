"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { refreshAccessToken } from "./auth";
import {
  EditUserFormData,
  RegisterFormData,
  SESSION_TERMINATED_MESSAGE,
} from "../schemas";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const BUFFER_TIME = 1000 * 60;
const getCurrentTime = () => new Date().toLocaleString();
export async function getUsers() {
  console.log(`fetching users at ${getCurrentTime()}`);
  const res = await fetchWithAuth("/users/", {}, "GET");
  if (!res.success) {
    if (res.message === SESSION_TERMINATED_MESSAGE) {
      throw new Error(SESSION_TERMINATED_MESSAGE);
    }
    return [];
  }
  return res.data ?? [];
}

export async function createUser(formData: RegisterFormData) {
  const res = await fetchWithAuth("/auth/register/", formData);
  if (!res.success && res.message === SESSION_TERMINATED_MESSAGE) {
    throw new Error(SESSION_TERMINATED_MESSAGE);
  }
  return res;
}

export async function deleteUser(id: string) {
  const res = await fetchWithAuth(`/users/${id}/`, {}, "DELETE");
  if (res.success) {
    return { success: true, message: "User deleted successfully" };
  }
  if (res.message === SESSION_TERMINATED_MESSAGE) {
    throw new Error(SESSION_TERMINATED_MESSAGE);
  }
  return { success: false, message: res.message || "Failed to delete user" };
}

export async function updateUser(id: string, data: EditUserFormData) {
  console.log(`Updating user with id: ${id} with data:`, data);
  const res = await fetchWithAuth(`/users/${id}/`, data, "PATCH");
  if (res.success) {
    return { success: true, message: "User updated successfully" };
  }
  if (res.message === SESSION_TERMINATED_MESSAGE) {
    throw new Error(SESSION_TERMINATED_MESSAGE);
  }
  return { success: false, message: res.message || "Failed to update user" };
}

export async function fetchWithAuth(
  endpoint: string,
  body: object,
  method = "POST"
) {
  "use server";
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("accessToken")?.value;

  const expiration = await getTokenExpiration(accessToken!);

  console.log("Expiration:", expiration);
  if (
    !accessToken ||
    (expiration && expiration < new Date(new Date().getTime() + BUFFER_TIME))
  ) {
    console.log(`access token is going to expire at ${expiration}`);
    const refreshResult = await refreshAccessToken();
    if (!refreshResult.success) {
      console.error("Session terminated: Unable to refresh access token");
      return { success: false, message: SESSION_TERMINATED_MESSAGE };
    }
    accessToken = cookieStore.get("accessToken")?.value;
  }

  try {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      ...(method !== "GET" && { body: JSON.stringify(body) }),
    };

    const response = await fetch(`${USER_SERVICE_URL}/${endpoint}`, options);
    const data = response.status === 204 ? [] : await response.json();
    if (!response.ok) {
      let errorMessage = "Request failed";
      if (typeof data.message === "string") {
        errorMessage = data.message;
      } else if (typeof data.message === "object") {
        const firstError = `${Object.values(data.message)[0]}`;
        errorMessage = firstError.charAt(0).toUpperCase() + firstError.slice(1);
      }
      throw new Error(errorMessage);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Fetch error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Request failed",
    };
  }
}
async function getTokenExpiration(
  token: string,
  secret?: string
): Promise<Date | null> {
  "use server";
  if (!token) return null;

  try {
    const decoded = secret ? jwt.verify(token, secret) : jwt.decode(token);

    if (!decoded || typeof decoded === "string") return null;

    return decoded.exp ? new Date(decoded.exp * 1000) : null;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired:", error.expiredAt);
      return new Date(error.expiredAt);
    }
    console.error("Error decoding JWT:", error);
    return null;
  }
}
