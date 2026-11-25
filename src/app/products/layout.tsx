import type { Viewport } from "next";

// A light page, like /ielts: the phone browser chrome follows the paper colour.
export const viewport: Viewport = {
  themeColor: "#edf3f8",
  colorScheme: "light",
};

export default function ProductsLayout({ children }: LayoutProps<"/products">) {
  return children;
}
