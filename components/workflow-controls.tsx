"use client"

import { useState } from "react"
import { useVoting } from "@/contexts/voting-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function WorkflowControls() {
  const {
    isAdmin,
    workflowStatus,
    startProposalsRegistering,
    endProposalsRegistering,
    startVotingSession,
    endVotingSession,
    tallyVotes,
    isLoading,
  } = useVoting()

  const [voteDuration, setVoteDuration] = useState("0")

  if (!isAdmin) return null

  const handleStartVoting = async () => {
    const duration = Number.parseInt(voteDuration) || 0
    await startVotingSession(duration)
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-france-blue text-white">
        <CardTitle>Contrôles administrateur</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {workflowStatus === "RegisteringVoters" && (
            <Button
              onClick={startProposalsRegistering}
              disabled={isLoading}
              className="w-full bg-france-blue hover:bg-france-blue/90"
            >
              Démarrer l'enregistrement des propositions
            </Button>
          )}

          {workflowStatus === "ProposalsRegistrationStarted" && (
            <Button
              onClick={endProposalsRegistering}
              disabled={isLoading}
              className="w-full bg-france-blue hover:bg-france-blue/90"
            >
              Terminer l'enregistrement des propositions
            </Button>
          )}

          {workflowStatus === "ProposalsRegistrationEnded" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="voteDuration">Durée du vote (minutes, 0 pour illimité)</Label>
                <Input
                  id="voteDuration"
                  type="number"
                  min="0"
                  value={voteDuration}
                  onChange={(e) => setVoteDuration(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              <Button
                onClick={handleStartVoting}
                disabled={isLoading}
                className="w-full bg-france-blue hover:bg-france-blue/90"
              >
                Démarrer la session de vote
              </Button>
            </div>
          )}

          {workflowStatus === "VotingSessionStarted" && (
            <Button
              onClick={endVotingSession}
              disabled={isLoading}
              className="w-full bg-france-blue hover:bg-france-blue/90"
            >
              Terminer la session de vote
            </Button>
          )}

          {workflowStatus === "VotingSessionEnded" && (
            <Button onClick={tallyVotes} disabled={isLoading} className="w-full bg-france-blue hover:bg-france-blue/90">
              Comptabiliser les votes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

