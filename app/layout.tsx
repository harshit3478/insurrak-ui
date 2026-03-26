import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/context-provider/ThemeProvider";
import { AuthProvider } from "@/context-provider/AuthProvider";
import StoreProvider from "@/context-provider/StoreProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Insurrack",
  description: "Insurance management portal",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  const stored = localStorage.getItem("theme");
                  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  const theme = stored ?? (prefersDark ? "dark" : "light");
                  if (theme === "dark") document.documentElement.classList.add("dark");
                  else document.documentElement.classList.remove("dark");
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased`}
      >
        <StoreProvider>
          <AuthProvider>
            <Providers>{children}</Providers> 
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
