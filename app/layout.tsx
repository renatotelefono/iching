// app/layout.tsx
import "./globals.css";

export const metadata = { title: "Lettura I Ching", description: "I Ching Reader – Next.js" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-dvh bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
