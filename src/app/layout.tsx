import PageTransition from "@/components/shared/page-transition";
import { SupabaseProvider } from "@/providers/supabase-provider";
import { jakarta } from "./fonts";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={jakarta.variable}
      style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
    >
      <body className="font-sans">
        <SupabaseProvider>{children}</SupabaseProvider>
        <PageTransition />
      </body>
    </html>
  );
}
