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

export function ProposalForm() {
  const { addProposal, isLoading } = useVoting()
  const [proposalDescription, setProposalDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleAddProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proposalDescription.trim()) {
      setError("Veuillez entrer une description pour votre proposition")
      return
    }

    try {
      setError(null)
      setSuccess(null)
      await addProposal(proposalDescription)
      setSuccess("Proposition ajoutée avec succès")
      setProposalDescription("")
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'ajout de la proposition")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-france-blue text-white rounded-t-lg">
        <CardTitle>Soumettre une proposition</CardTitle>
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

        <form onSubmit={handleAddProposal} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proposalDescription">Description de la proposition</Label>
            <Input
              id="proposalDescription"
              placeholder="Votre proposition..."
              value={proposalDescription}
              onChange={(e) => setProposalDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-france-blue hover:bg-france-blue/90">
            {isLoading ? "Soumission en cours..." : "Soumettre la proposition"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

