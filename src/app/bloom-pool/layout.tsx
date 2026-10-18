import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#efe6d4",
  colorScheme: "light",
};

export default function BloomPoolLayout({ children }: LayoutProps<"/bloom-pool">) {
  return children;
}
