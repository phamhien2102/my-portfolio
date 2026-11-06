import type { Viewport } from "next";

// A light page, like /native: the phone browser chrome follows it.
export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function AiWorkflowLayout({ children }: LayoutProps<"/ai-workflow">) {
  return children;
}
