import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const shurjo = localFont({
  src: "../../public/Shurjo.ttf",
  display: "swap",
});

export const metadata: Metadata = {
  title: "লেনা-দেনা | খরচ ভাগ করার অ্যাপ",
  description: "সহজ ঋণ সরলীকরণ ও ভিজ্যুয়াল গ্রাফের মাধ্যমে গ্রুপের খরচ পরিচালনা করুন।",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="dark" suppressHydrationWarning>
      <body className={shurjo.className} suppressHydrationWarning>
        <div id="root-container">
          {children}
        </div>
      </body>
    </html>
  );
}
