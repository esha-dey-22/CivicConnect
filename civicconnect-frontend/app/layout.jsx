import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ReportProvider } from "./context/ReportContext";
import AppChrome from "../components/AppChrome";
import CustomChatWidget from "../components/CustomChatWidget";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Civic Connect",
  description: "Empowering communities with smart, dark‑themed civic tools",
};

export default function RootLayout({ children }) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {clerkPublishableKey ? (
          <ClerkProvider
            appearance={{
              baseTheme: "dark",
            }}
          >
            <ReportProvider>
              <AppChrome>{children}</AppChrome>
              <CustomChatWidget />
            </ReportProvider>
          </ClerkProvider>
        ) : (
          <ReportProvider>
            <AppChrome>{children}</AppChrome>
            <CustomChatWidget />
          </ReportProvider>
        )}
      </body>
    </html>
  );
}
