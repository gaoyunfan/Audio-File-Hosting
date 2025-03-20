import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast, Bounce } from "react-toastify";

export const TERMINATED_MESSAGE = "Session terminated";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toastSucccess(message: string) {
  toast.success(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Bounce,
  });
}

export function toastError(message: string) {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Bounce,
  });
}
