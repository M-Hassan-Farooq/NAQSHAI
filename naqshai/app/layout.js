import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProfileProvider } from "@/context/ProfileContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import FavoriteSyncNotice from "@/components/FavoriteSyncNotice";
import CookieNotice from "@/components/CookieNotice";
import SiteAnalyticsTracker from "@/components/SiteAnalyticsTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "NAQSHAI - Pakistan Real Estate Intelligence",
  description: "Interactive 3D Plot Mapping & AI Valuation Portal",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="bg-page text-ink antialiased min-h-full flex flex-col">
        <SiteAnalyticsTracker />
        <ProfileProvider>
          <FavoritesProvider>
            <FavoriteSyncNotice />
            <CookieNotice />
            {children}
          </FavoritesProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}
