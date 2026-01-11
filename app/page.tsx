import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-foreground">EMPATHY</h1>
        <p className="text-muted-foreground">Performance Analysis System</p>
        <p className="text-sm text-muted-foreground max-w-md">
          Sistema avanzato di analisi metabolica per ciclisti e atleti di endurance
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/login">
            <Button size="lg">Accedi</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">
              Registrati
            </Button>
          </Link>
        </div>
        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Vai alla Dashboard →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
