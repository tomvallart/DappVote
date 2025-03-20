"use client"

import { useState } from "react"
import { useVoting } from "@/contexts/voting-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RefreshCw } from "lucide-react"

export function ResetVoting() {
  const { resetVoting, isAdmin, isLoading } = useVoting()
  const [isOpen, setIsOpen] = useState(false)

  const handleReset = async () => {
    try {
      await resetVoting()
      setIsOpen(false)
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du vote:", error)
    }
  }

  if (!isAdmin) return null

  return (
    <Card className="w-full overflow-hidden mt-6">
      <CardHeader className="bg-france-blue text-white">
        <CardTitle className="flex items-center">
          <RefreshCw className="mr-2 h-5 w-5" />
          Réinitialiser le vote
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button className="w-full bg-france-blue hover:bg-france-blue/90" disabled={isLoading}>
              Commencer un nouveau vote
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr de vouloir réinitialiser le vote ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action va réinitialiser le processus de vote. Toutes les propositions et les votes seront effacés,
                mais les électeurs resteront enregistrés.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset} className="bg-france-blue hover:bg-france-blue/90">
                Réinitialiser
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}

