import type { Viewport } from "next";

// A light page, like /design-system: the phone browser chrome follows the paper colour.
export const viewport: Viewport = {
  themeColor: "#f4ebe0",
  colorScheme: "light",
};

export default function AlgoLabLayout({ children }: LayoutProps<"/algo-lab">) {
  return children;
}
