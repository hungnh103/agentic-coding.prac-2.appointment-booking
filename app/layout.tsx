import type { Metadata } from "next";

import "./globals.css";

import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: "Appointment Booking",
  description: "Dental and maxillofacial clinic booking experience."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

