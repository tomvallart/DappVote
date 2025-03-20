"use client"

import type React from "react"

import { useState } from "react"
import { useVoting } from "@/contexts/voting-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function VoteDelegation() {
  const { delegateVote, isLoading } = useVoting()
  const [delegateAddress, setDelegateAddress] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleDelegateVote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!delegateAddress) {
      setError("Veuillez entrer une adresse valide")
      return
    }

    try {
      setError(null)
      setSuccess(null)
      await delegateVote(delegateAddress)
      setSuccess(`Vote délégué avec succès à ${delegateAddress}`)
      setDelegateAddress("")
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la délégation du vote")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-france-blue text-white rounded-t-lg">
        <CardTitle>Déléguer mon vote</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 border-green-500 text-green-700">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Succès</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleDelegateVote} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delegateAddress">Adresse du délégué</Label>
            <Input
              id="delegateAddress"
              placeholder="0x..."
              value={delegateAddress}
              onChange={(e) => setDelegateAddress(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-france-blue hover:bg-france-blue/90">
            {isLoading ? "Délégation en cours..." : "Déléguer mon vote"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

