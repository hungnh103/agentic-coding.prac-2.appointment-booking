import type { Metadata } from "next";

import "./globals.css";

import { Providers } from "@/app/providers";
import { SkipLink } from "@/components/ui/skip-link";

export const metadata: Metadata = {
  title: "Appointment Booking",
  description: "Dental and maxillofacial clinic booking experience."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SkipLink />
          {children}
        </Providers>
      </body>
    </html>
  );
}
