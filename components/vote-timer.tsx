"use client"

import { useEffect, useState } from "react"
import { useVoting } from "@/contexts/voting-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function VoteTimer() {
  const { votingEndTime, workflowStatus } = useVoting()
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!votingEndTime || workflowStatus !== "VotingSessionStarted") {
      setTimeLeft(null)
      return
    }

    const calculateTimeLeft = () => {
      const now = Date.now()
      const diff = votingEndTime - now

      if (diff <= 0) {
        setTimeLeft(0)
        setProgress(0)
        return
      }

      setTimeLeft(diff)

      // Calculer le pourcentage de temps restant
      const totalDuration = votingEndTime - (now - diff) // Durée totale du vote
      const percentLeft = (diff / totalDuration) * 100
      setProgress(percentLeft)
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [votingEndTime, workflowStatus])

  if (!votingEndTime || timeLeft === null || workflowStatus !== "VotingSessionStarted") {
    return null
  }

  // Convertir les millisecondes en format lisible
  const hours = Math.floor(timeLeft / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Temps restant pour voter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-2xl font-bold mb-2">
          {hours.toString().padStart(2, "0")}:{minutes.toString().padStart(2, "0")}:
          {seconds.toString().padStart(2, "0")}
        </div>
        <Progress value={progress} className="h-2" />
      </CardContent>
    </Card>
  )
}

