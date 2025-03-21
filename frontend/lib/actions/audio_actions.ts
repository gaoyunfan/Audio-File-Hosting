"use server";

import { cookies } from "next/headers";
import { SESSION_TERMINATED_MESSAGE } from "../schemas";
import {
  handleRefresh,
} from "./user_actions";
import { getUserSession } from "./auth";
const AUDIO_SERVICE_URL = process.env.AUDIO_SERVICE_URL;

async function fetchWithJWT(endpoint: string, body: object, method = "POST") {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    ...(method !== "GET" && { body: JSON.stringify(body) }),
  };
  console.log(`fetchWithJWT:`, endpoint, options);

  return fetch(`${AUDIO_SERVICE_URL}/${endpoint}`, options);
}
export async function getAudios() {
  const res = await fetchWithJWT("/audios/", {}, "GET");
  if ("status" in res && res.status === 403) {
    const session = await getUserSession();
    session.destroy();
    const cookie = await cookies();
    cookie.delete("accessToken");
    cookie.delete("refreshToken");
    throw new Error(SESSION_TERMINATED_MESSAGE);
  }
  if (!res.ok) {
    return [];
  }
  return await res.json();
}

export async function getCategories() {
  const expiration_check = await handleRefresh();
  if (!expiration_check.success) {
    throw new Error(SESSION_TERMINATED_MESSAGE);
  }

  const res = await fetchWithJWT("/categories/", {}, "GET");
  if (res.status === 403) {
    const session = await getUserSession();
    session.destroy();
    const cookie = await cookies();
    cookie.delete("accessToken");
    cookie.delete("refreshToken");
    throw new Error(SESSION_TERMINATED_MESSAGE);
  }
  if (!res.ok) {
    return [];
  }
  return await res.json();
}

export async function getUploadUrl(formData: {
  filename: string;
  description: string;
  category_id: string;
}) {
  const expiration_check = await handleRefresh();
  if (!expiration_check.success) {
    throw new Error(SESSION_TERMINATED_MESSAGE);
  }

  const res = await fetchWithJWT("/upload/", formData);
  if (res.status === 403) {
    const session = await getUserSession();
    session.destroy();
    const cookie = await cookies();
    cookie.delete("accessToken");
    cookie.delete("refreshToken");
    throw new Error(SESSION_TERMINATED_MESSAGE);
  }
  if (!res.ok) {
    return { success: false, message: "Failed to get upload URL" };
  }
  const data = await res.json();
  return { success: true, data };
}

export async function uploadAudio(file: File, url: string) {
  console.log(`uploading audo to ${url}, file: ${file}`);
  const expiration_check = await handleRefresh();
  if (!expiration_check.success) {
    throw new Error(SESSION_TERMINATED_MESSAGE);
  }
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "audio/mpeg",
    },
    body: file,
  });
  console.log(`uploadAudio response:`, res, res.statusText);
  if (!res.ok) {
    const text = await res.text();
    console.error(`Failed to upload audio: ${text}`);
    return { success: false, message: "Failed to upload audio" };
  }
  return { success: true, message: "Audio uploaded successfully" };
}

export async function deleteAudio(audioId: string) {
  console.log(`deleting audio ${audioId}`);

  const expiration_check = await handleRefresh();
  if (!expiration_check.success) {
    throw new Error(SESSION_TERMINATED_MESSAGE);
  }
  const res = await fetchWithJWT(`/audios/${audioId}/`, {}, "DELETE");
  if (res.status === 403) {
    const errorData = await res.json();
    console.log(`deleteAudio error:`, errorData);
    const session = await getUserSession();
    session.destroy();
    const cookie = await cookies();
    cookie.delete("accessToken");
    cookie.delete("refreshToken");
    throw new Error(SESSION_TERMINATED_MESSAGE);
  }
  if (!res.ok) {
    return { success: false, message: "Failed to delete audio" };
  }
  return { success: true, message: "Audio deleted successfully" };
}

export async function updateAudio(
  audioId: string,
  formData: {
    filename: string;
    description: string;
    category_id: string;
  }
) {
  console.log("Updating audio with data:", formData);
  const expiration_check = await handleRefresh();
  if (!expiration_check.success) {
    throw new Error(SESSION_TERMINATED_MESSAGE);
  }
  const res = await fetchWithJWT(`/audios/${audioId}/`, formData, "PUT");
  if (res.status === 403) {
    const session = await getUserSession();
    session.destroy();
    const cookie = await cookies();
    cookie.delete("accessToken");
    cookie.delete("refreshToken");
    throw new Error(SESSION_TERMINATED_MESSAGE);
  }
  if (!res.ok) {
    return { success: false, message: "Failed to update audio" };
  }
  return { success: true, message: "Audio updated successfully" };
}
