import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProfileProvider } from "@/context/ProfileContext";
import { FavoritesProvider } from "@/context/FavoritesContext";

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
      <body className="bg-slate-100 text-slate-600 antialiased min-h-full flex flex-col">
        <ProfileProvider>
          <FavoritesProvider>
            {children}
          </FavoritesProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}
