import type { Viewport } from "next";

// A light page, like /ielts: the phone browser chrome follows the paper colour.
export const viewport: Viewport = {
  themeColor: "#f4ebe0",
  colorScheme: "light",
};

export default function DesignSystemLayout({ children }: LayoutProps<"/design-system">) {
  return children;
}
