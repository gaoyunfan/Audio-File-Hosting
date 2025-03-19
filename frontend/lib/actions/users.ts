"use server";

export async function getUsers() {
  try {
    const response = await fetch("/api/users");
    return response.json();
  } catch (error) {
    console.error("Error fetching users", error);
    return { error: "Error fetching users" };
  }
}
