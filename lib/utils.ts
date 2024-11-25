import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const charLimit = (text: string, charLimit: number) => {
  return text.length > charLimit ? text.slice(0, charLimit) + "..." : text;
};

export const wordLimit = (text: string, wordLimit: number) => {
  const words = text.split(" ");
  return words.length > wordLimit
    ? words.slice(0, wordLimit).join(" ") +
        (words.length > wordLimit ? "..." : "")
    : text;
};

export const validateUsername = (username: string) => {
  const errors = [];

  if (username.length < 5 || username.length > 16) {
    errors.push("Username must be between 5 and 16 characters long.");
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push("Username can only contain letters, numbers, and underscores.");
  }

  if (username.startsWith("_") || username.endsWith("_")) {
    errors.push("Username cannot start or end with an underscore.");
  }

  if (username.includes("__")) {
    errors.push("Username cannot contain consecutive underscores.");
  }

  return errors;
};
