import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface ResultsProps {
  results: {
    status: string
    runtime: string
    memory: string
  } | null
}

export function Results({ results }: ResultsProps) {
  if (!results) {
    return <div className="text-muted-foreground">No results yet. Run your code to see the results.</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Status: {results.status}</p>
        <p>Runtime: {results.runtime}</p>
        <p>Memory Usage: {results.memory}</p>
      </CardContent>
    </Card>
  )
}

