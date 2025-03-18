import { Outfit } from "next/font/google"; // ✅ Fix import
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata = {
  title: "Shamos Youtube Downloader",
  description: "Download any youtube video to your device",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
       <body className={`${outfit.className} antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
