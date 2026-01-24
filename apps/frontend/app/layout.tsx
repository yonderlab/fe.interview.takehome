import "@/styles/globals.css";
import "@radix-ui/themes/styles.css";

import { Metadata } from "next";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { StepIndicator } from "@/components/StepIndicator";
import { GlobalAlert } from "@/components/GlobalAlert";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers>
          <div className="relative flex flex-col h-screen py-4">
            <StepIndicator />
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
              <GlobalAlert />
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
