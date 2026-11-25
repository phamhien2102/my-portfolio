import type { Viewport } from "next";

// A light page, like /ielts: the phone browser chrome follows it.
export const viewport: Viewport = {
  themeColor: "#edf3f8",
  colorScheme: "light",
};

export default function AiWorkflowLayout({ children }: LayoutProps<"/ai-workflow">) {
  return children;
}
