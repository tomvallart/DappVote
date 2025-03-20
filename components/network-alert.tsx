"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useVoting } from "@/contexts/voting-context"
import { AlertCircle, ArrowRight } from "lucide-react"

export function NetworkAlert() {
  const { networkError, isCorrectNetwork, switchNetwork, isConnected } = useVoting()

  if (!isConnected) return null

  if (networkError) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur de réseau</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>{networkError}</p>
          <Button onClick={switchNetwork} variant="outline" className="w-full sm:w-auto flex items-center gap-2 mt-2">
            Passer au réseau Sepolia <ArrowRight className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Mauvais réseau</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>Vous n'êtes pas connecté au réseau Sepolia. Veuillez changer de réseau pour utiliser l'application.</p>
          <Button onClick={switchNetwork} variant="outline" className="w-full sm:w-auto flex items-center gap-2 mt-2">
            Passer au réseau Sepolia <ArrowRight className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}

