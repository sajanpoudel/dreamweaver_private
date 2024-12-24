import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import Navigation from "@/components/nav/Navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Dream Weaver",
  description: "Capture and analyze your dreams with AI-powered insights",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {session && <Navigation />}
          {children}
        </Providers>
      </body>
    </html>
  );
}
