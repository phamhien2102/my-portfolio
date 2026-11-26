import type { Viewport } from "next";

// A light page: the phone browser chrome follows it.
export const viewport: Viewport = {
  themeColor: "#edf3f8",
  colorScheme: "light",
};

export default function CustomResumeLayout({ children }: LayoutProps<"/custom-resume">) {
  return children;
}
