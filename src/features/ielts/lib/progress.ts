import { createChecklist } from "@/lib/checklist";

/** Which chapters have been marked as read, kept in this browser only. */
export const useProgress = createChecklist("ielts-read");
