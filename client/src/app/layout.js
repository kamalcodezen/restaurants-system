import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import "./globals.css";
import GravityProvider from "@/components/GravityProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata = {
  title: "Gourmet Haven - Dashboard",
  description: "Premium Restaurant Management System",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme="sweetrose"
      className={`${outfit.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GravityProvider>
          {children}
        </GravityProvider>
      </body>
    </html>
  );
}
