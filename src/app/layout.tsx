import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HostOp Trial",
  description: "Multi-tenant reservation analytics for the HostOp engineering trial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
