"use client"

import { useVoting } from "@/contexts/voting-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function DebugInfo() {
  const { account, isAdmin, isVoter, workflowStatus, isConnected, isCorrectNetwork, proposals, voters } = useVoting()

  const [showDebug, setShowDebug] = useState(false)

  if (!isConnected) return null

  return (
    <div className="mt-8">
      <Button onClick={() => setShowDebug(!showDebug)} variant="outline" size="sm" className="mb-2">
        {showDebug ? "Masquer" : "Afficher"} les informations de débogage
      </Button>

      {showDebug && (
        <Card className="w-full overflow-hidden">
          <CardHeader className="bg-gray-200">
            <CardTitle>Informations de débogage</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2 text-sm font-mono">
              <p>
                <strong>Compte:</strong> {account || "Non connecté"}
              </p>
              <p>
                <strong>Réseau correct:</strong> {isCorrectNetwork ? "Oui" : "Non"}
              </p>
              <p>
                <strong>Est admin:</strong> {isAdmin ? "Oui" : "Non"}
              </p>
              <p>
                <strong>Est électeur:</strong> {isVoter ? "Oui" : "Non"}
              </p>
              <p>
                <strong>Statut du workflow:</strong> {workflowStatus}
              </p>
              <p>
                <strong>Nombre de propositions:</strong> {proposals.length}
              </p>
              <p>
                <strong>Informations de l'électeur actuel:</strong>{" "}
                {account && voters[account]
                  ? `Inscrit: ${voters[account].isRegistered}, A voté: ${voters[account].hasVoted}, ID de proposition votée: ${voters[account].votedProposalId}`
                  : "Aucune information disponible"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

