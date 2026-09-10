"use server";
import { logout } from "@/server/auth/logout";

export async function logoutAction() {
  return logout();
}
