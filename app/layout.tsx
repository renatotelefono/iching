// app/layout.tsx
import "./globals.css";
import Script from "next/script";

export const metadata = { 
  title: "Lettura I Ching", 
  description: "I Ching Reader – Next.js" 
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-C7FVN189Y0"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-C7FVN189Y0');
          `}
        </Script>
      </head>
      <body className="min-h-dvh bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
