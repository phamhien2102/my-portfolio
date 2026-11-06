import type { Viewport } from "next";

// The only light page besides /bloom-pool: the phone browser chrome follows it.
export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function NativeLayout({ children }: LayoutProps<"/native">) {
  return children;
}
