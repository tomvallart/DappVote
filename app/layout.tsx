import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { VotingProvider } from "@/contexts/voting-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DAppVote - Application de vote décentralisée",
  description: "Une application de vote décentralisée aux couleurs de la France",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <VotingProvider>{children}</VotingProvider>
      </body>
    </html>
  )
}



import './globals.css'