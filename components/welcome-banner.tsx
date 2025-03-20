"use client"

import { useVoting } from "@/contexts/voting-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function WelcomeBanner() {
  const { isConnected, connect, isLoading } = useVoting()

  if (isConnected) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Drapeau français bien visible en haut */}
      <div className="w-full france-gradient h-64 rounded-lg flex items-center justify-center"></div>

      {/* Carte de bienvenue en dessous du drapeau */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Bienvenue sur DAppVote</CardTitle>
          <CardDescription className="text-center">
            La plateforme de vote décentralisée aux couleurs de la France
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4">
            Connectez-vous avec votre portefeuille Ethereum pour participer au processus de vote.
          </p>
          <Button onClick={connect} className="w-full bg-france-blue hover:bg-france-blue/90" disabled={isLoading}>
            Connexion
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

