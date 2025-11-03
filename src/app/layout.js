import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import SeedUsers from "@/components/SeedUsers";
import ToastContainer from "@/components/ui/Toast";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Reforesta Manabí - Iniciativa Ambiental",
  description: "Proyecto de reforestación en Manabí, Ecuador",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <SeedUsers />
              <ToastContainer />
              <AppSidebar />
              <SidebarInset>
                <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-white/95 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 dark:bg-gray-950/95 dark:border-gray-800">
                  <div className="flex items-center gap-2 px-4 w-full">
                    <SidebarTrigger className="-ml-1 shrink-0" />
                    <Separator
                      orientation="vertical"
                      className="mr-2 shrink-0 data-[orientation=vertical]:h-4"
                    />
                    <DynamicBreadcrumb />
                  </div>
                </header>
                <div className="flex flex-col min-h-[calc(100vh-4rem)]">
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                </div>
              </SidebarInset>
            </SidebarProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
