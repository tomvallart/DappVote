"use client"

import { useVoting } from "@/contexts/voting-context"
import { workflowStatusLabels, type WorkflowStatus as WorkflowStatusType } from "@/types"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle } from "lucide-react"

export function WorkflowStatus() {
  const {
    workflowStatus,
    isAdmin,
    startProposalsRegistering,
    endProposalsRegistering,
    startVotingSession,
    endVotingSession,
    tallyVotes,
    isLoading,
  } = useVoting()

  const workflowSteps: WorkflowStatusType[] = [
    "RegisteringVoters",
    "ProposalsRegistrationStarted",
    "ProposalsRegistrationEnded",
    "VotingSessionStarted",
    "VotingSessionEnded",
    "VotesTallied",
  ]

  const currentStepIndex = workflowSteps.indexOf(workflowStatus)

  const handleNextStep = async () => {
    try {
      switch (workflowStatus) {
        case "RegisteringVoters":
          await startProposalsRegistering()
          break
        case "ProposalsRegistrationStarted":
          await endProposalsRegistering()
          break
        case "ProposalsRegistrationEnded":
          await startVotingSession()
          break
        case "VotingSessionStarted":
          await endVotingSession()
          break
        case "VotingSessionEnded":
          await tallyVotes()
          break
        default:
          break
      }
    } catch (error) {
      console.error("Erreur lors du changement d'étape:", error)
    }
  }

  return (
    <div className="w-full p-4 border rounded-lg bg-white">
      <h2 className="text-xl font-bold mb-4">Statut du Processus de Vote</h2>

      <div className="space-y-4">
        {workflowSteps.map((step, index) => (
          <div
            key={step}
            className={`flex items-center p-3 rounded-md ${
              index === currentStepIndex
                ? "bg-france-blue text-white"
                : index < currentStepIndex
                  ? "bg-muted"
                  : "bg-gray-100"
            }`}
          >
            <div className="mr-3">
              {index < currentStepIndex ? (
                <CheckCircle className="h-5 w-5" />
              ) : index === currentStepIndex ? (
                <Circle className="h-5 w-5 fill-white stroke-france-blue" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </div>
            <span>{workflowStatusLabels[step]}</span>
          </div>
        ))}
      </div>

      {isAdmin && currentStepIndex < workflowSteps.length - 1 && (
        <Button
          onClick={handleNextStep}
          className="mt-4 w-full bg-france-blue hover:bg-france-blue/90"
          disabled={isLoading}
        >
          Passer à l'étape suivante
        </Button>
      )}
    </div>
  )
}

