"use client"

import { useVoting } from "@/contexts/voting-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"

export function VotingResults() {
  const { proposals, workflowStatus, winningProposalId } = useVoting()

  if (workflowStatus !== "VotesTallied" || winningProposalId === null) {
    return null
  }

  const winningProposal = proposals.find((p) => p.id === winningProposalId)

  if (!winningProposal) {
    return null
  }

  return (
    <Card className="w-full border-france-red">
      <CardHeader className="bg-france-red text-white rounded-t-lg">
        <CardTitle className="flex items-center">
          <Trophy className="mr-2 h-5 w-5" />
          Résultat Final du Vote
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold">Proposition gagnante: #{winningProposal.id + 1}</h3>
          <p className="text-lg">{winningProposal.description}</p>
          <p className="text-france-blue font-bold text-xl mt-2">
            {winningProposal.voteCount} vote{winningProposal.voteCount !== 1 ? "s" : ""}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

