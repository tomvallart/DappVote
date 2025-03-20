"use client"

import { useVoting } from "@/contexts/voting-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Trophy } from "lucide-react"

export function ProposalsList() {
  const { proposals, workflowStatus, isVoter, voters, account, setVote, winningProposalId, isLoading } = useVoting()

  const hasVoted = account && voters[account]?.hasVoted
  const votedProposalId = account && voters[account]?.votedProposalId

  const canVote = isVoter && workflowStatus === "VotingSessionStarted" && !hasVoted

  const showResults = workflowStatus === "VotesTallied"

  const handleVote = async (proposalId: number) => {
    try {
      await setVote(proposalId)
    } catch (error) {
      console.error("Erreur lors du vote:", error)
    }
  }

  if (proposals.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="bg-france-blue text-white rounded-t-lg">
          <CardTitle>Propositions</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 text-center py-8">Aucune proposition disponible pour le moment.</CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-france-blue text-white rounded-t-lg">
        <CardTitle>{showResults ? "Résultats du Vote" : "Propositions"}</CardTitle>
        {canVote && <CardDescription className="text-gray-200">Votez pour votre proposition préférée</CardDescription>}
        {hasVoted && workflowStatus === "VotingSessionStarted" && (
          <CardDescription className="text-gray-200">Vous avez déjà voté</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className={`p-4 border rounded-md ${
                votedProposalId === proposal.id ? "border-france-blue bg-france-blue/5" : ""
              } ${winningProposalId === proposal.id ? "border-france-red bg-france-red/5" : ""}`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-medium flex items-center">
                    Proposition #{proposal.id + 1}
                    {votedProposalId === proposal.id && <CheckCircle className="ml-2 h-4 w-4 text-france-blue" />}
                    {winningProposalId === proposal.id && <Trophy className="ml-2 h-4 w-4 text-france-red" />}
                  </h3>
                  <p className="text-gray-700">{proposal.description}</p>
                </div>

                {canVote && (
                  <Button
                    onClick={() => handleVote(proposal.id)}
                    disabled={isLoading}
                    className="bg-france-blue hover:bg-france-blue/90"
                    size="sm"
                  >
                    Voter
                  </Button>
                )}

                {showResults && (
                  <div className="text-right">
                    <span className="text-lg font-bold">{proposal.voteCount}</span>
                    <span className="text-gray-500 ml-1">vote{proposal.voteCount !== 1 ? "s" : ""}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

