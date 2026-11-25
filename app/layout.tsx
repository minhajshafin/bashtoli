import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AnalyticsIdle } from "@/components/analytics-idle";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Bashtoli Stationery",
    default: "Bashtoli Stationery",
  },
  description: "Handcrafted stationery, artisanal paper goods, journals, and desktop crafts from Bashtoli.",
  manifest: "/site.webmanifest",
};

const ADMIN_THEME_INIT_SCRIPT = `(function(){try{if(location.pathname.startsWith('/admin')){var t=localStorage.getItem('bashtoli-admin-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.adminTheme=t;}}}catch(e){}})();`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${cormorantGaramond.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: ADMIN_THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <AnalyticsIdle />
      </body>
    </html>
  );
}

