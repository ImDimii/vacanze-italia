import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { getSiteSettings } from "@/app/actions/settings";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.site_name || "VacanzeItalia";
  return {
    title: `${siteName} - Affitti Esclusivi`,
    description: `Trova il tuo rifugio perfetto. Case vacanze esclusive in tutta Italia con ${siteName}.`,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="it"
      className={`${inter.variable} ${playfair.variable} dark antialiased h-full`}
    >
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden">
        <AuthProvider>
          <TooltipProvider>
            <Navbar siteName={settings?.site_name || "VacanzeItalia"} />
            <main className="flex-1">
              {children}
            </main>
            <Footer 
              siteName={settings?.site_name || "VacanzeItalia"} 
              contactEmail={settings?.contact_email || "info@vacanzeitalia.it"}
              contactPhone={settings?.contact_phone || "+39 0123 456789"}
            />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

