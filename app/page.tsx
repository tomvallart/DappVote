"use client"

import { Header } from "@/components/header"
import { NetworkAlert } from "@/components/network-alert"
import { ProposalForm } from "@/components/proposal-form"
import { ProposalsList } from "@/components/proposals-list"
import { RefreshButton } from "@/components/refresh-button"
import { ResetVoting } from "@/components/reset-voting"
import { VoteDelegation } from "@/components/vote-delegation"
import { VoteTimer } from "@/components/vote-timer"
import { VoterManagement } from "@/components/voter-management"
import { VotingResults } from "@/components/voting-results"
import { WelcomeBanner } from "@/components/welcome-banner"
import { WorkflowControls } from "@/components/workflow-controls"
import { WorkflowStatus } from "@/components/workflow-status"
import { useVoting } from "@/contexts/voting-context"

export default function Home() {
  const { isConnected, isAdmin, isVoter, workflowStatus, isCorrectNetwork } = useVoting()

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <WelcomeBanner />
        <NetworkAlert />

        {isConnected && isCorrectNetwork && (
          <div className="mt-8 space-y-8">
            {/* Bouton de rafraîchissement visible uniquement après connexion */}
            <RefreshButton />

            <WorkflowStatus />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isAdmin && workflowStatus === "RegisteringVoters" && <VoterManagement />}

              {isAdmin && <WorkflowControls />}

              {isVoter && workflowStatus === "ProposalsRegistrationStarted" && <ProposalForm />}

              {workflowStatus === "VotingSessionStarted" && <VoteTimer />}

              {isVoter && workflowStatus === "VotingSessionStarted" && <VoteDelegation />}
            </div>

            {(workflowStatus === "ProposalsRegistrationStarted" ||
              workflowStatus === "ProposalsRegistrationEnded" ||
              workflowStatus === "VotingSessionStarted" ||
              workflowStatus === "VotingSessionEnded") && <ProposalsList />}

            {workflowStatus === "VotesTallied" && (
              <>
                <VotingResults />
                {isAdmin && <ResetVoting />}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

