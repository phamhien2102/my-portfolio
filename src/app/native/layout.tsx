import type { Viewport } from "next";

// The only light page besides /bloom-pool: the phone browser chrome follows it.
export const viewport: Viewport = {
  themeColor: "#edf3f8",
  colorScheme: "light",
};

export default function NativeLayout({ children }: LayoutProps<"/native">) {
  return children;
}
