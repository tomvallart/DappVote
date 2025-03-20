"use client"

import { useVoting } from "@/contexts/voting-context"
import { Button } from "@/components/ui/button"
import { workflowStatusLabels } from "@/types"

export function Header() {
  const { account, isConnected, connect, disconnect, workflowStatus, isLoading } = useVoting()

  return (
    <header className="w-full py-4 border-b">
      <div className="container flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-france-blue"></div>
          <h1 className="text-2xl font-bold">DAppVote</h1>
          <div className="h-8 w-8 rounded-full bg-france-red"></div>
        </div>

        <div className="flex items-center space-x-4">
          {workflowStatus && (
            <div className="hidden md:block px-4 py-2 rounded-md bg-muted text-muted-foreground">
              {workflowStatusLabels[workflowStatus]}
            </div>
          )}

          {isConnected ? (
            <div className="flex items-center space-x-2">
              <div className="hidden md:block px-4 py-2 rounded-md bg-muted">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </div>
              <Button variant="outline" onClick={disconnect} disabled={isLoading}>
                Déconnexion
              </Button>
            </div>
          ) : (
            <Button onClick={connect} disabled={isLoading} className="bg-france-blue hover:bg-france-blue/90">
              Connexion
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

