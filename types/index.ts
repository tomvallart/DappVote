export type Voter = {
  address: string
  isRegistered: boolean
  hasVoted: boolean
  votedProposalId: number
}

export type Proposal = {
  id: number
  description: string
  voteCount: number
}

export type WorkflowStatus =
  | "RegisteringVoters"
  | "ProposalsRegistrationStarted"
  | "ProposalsRegistrationEnded"
  | "VotingSessionStarted"
  | "VotingSessionEnded"
  | "VotesTallied"

export const workflowStatusLabels: Record<WorkflowStatus, string> = {
  RegisteringVoters: "Enregistrement des électeurs",
  ProposalsRegistrationStarted: "Enregistrement des propositions en cours",
  ProposalsRegistrationEnded: "Enregistrement des propositions terminé",
  VotingSessionStarted: "Session de vote en cours",
  VotingSessionEnded: "Session de vote terminée",
  VotesTallied: "Votes comptabilisés",
}

