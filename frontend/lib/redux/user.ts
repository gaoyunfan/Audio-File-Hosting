import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/lib/schemas";

const loadUserFromStorage = (): User => {
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : { id: "", username: "" };
  }
  return { id: "", username: "" }; // Default initial state for SSR
};

const initialState: User = loadUserFromStorage();

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.id = action.payload.id;
      state.username = action.payload.username;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    clearUser: () => {
      localStorage.removeItem("user");
      return { id: "", username: "" };
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;