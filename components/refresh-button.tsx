"use client"

import { Button } from "@/components/ui/button"
import { useVoting } from "@/contexts/voting-context"
import { RefreshCw } from "lucide-react"

export function RefreshButton() {
  const { refreshData, isLoading } = useVoting()

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Données du vote</h2>
          <p className="text-sm text-gray-500">Rafraîchissez les données pour voir les dernières mises à jour</p>
        </div>
        <Button
          onClick={refreshData}
          disabled={isLoading}
          className="bg-france-blue hover:bg-france-blue/90 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {isLoading ? "Chargement..." : "Rafraîchir"}
        </Button>
      </div>
    </div>
  )
}

