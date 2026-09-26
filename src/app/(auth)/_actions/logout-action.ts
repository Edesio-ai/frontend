"use server";
import { logout } from "@/server/auth";

export async function logoutAction() {
  return await logout();
}
