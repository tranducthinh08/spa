import { revalidatePath } from "next/cache";

export function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Safely ignore when called outside of Next.js HTTP request lifecycle (e.g. standalone test scripts)
  }
}
