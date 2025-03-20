"use client"

import type React from "react"

import { useState } from "react"
import { useVoting } from "@/contexts/voting-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ethers } from "ethers"

export function VoterManagement() {
  const { addVoter, isAdmin, workflowStatus, isLoading } = useVoting()
  const [voterAddress, setVoterAddress] = useState("")
  const [error, setError] = useState("")

  const handleAddVoter = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!ethers.isAddress(voterAddress)) {
      setError("Adresse Ethereum invalide")
      return
    }

    try {
      await addVoter(voterAddress)
      setVoterAddress("")
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue")
    }
  }

  if (!isAdmin || workflowStatus !== "RegisteringVoters") {
    return null
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-france-blue text-white">
        <CardTitle>Gestion des Électeurs</CardTitle>
        <CardDescription className="text-gray-200">Ajoutez des électeurs à la liste blanche</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleAddVoter} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="voter-address" className="text-sm font-medium">
              Adresse de l'électeur
            </label>
            <Input
              id="voter-address"
              placeholder="0x..."
              value={voterAddress}
              onChange={(e) => setVoterAddress(e.target.value)}
              className="w-full border-france-blue/30 focus-visible:ring-france-blue"
            />
            {error && <p className="text-france-red text-sm">{error}</p>}
          </div>

          <Button
            type="submit"
            className="w-full bg-france-blue hover:bg-france-blue/90"
            disabled={isLoading || !voterAddress}
          >
            Ajouter l'électeur
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

