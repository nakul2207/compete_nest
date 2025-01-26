import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useAppSelector } from "@/redux/hook"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader } from "@/components/Loader"
import { getContestById } from "@/api/contestApi"

interface Problem {
  id: string
}

interface Contest {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  problems: string[]
  status: string
  createdAt: string
  updatedAt: string
  userId: string
}

const Contest: React.FC = () => {
  const { contest_id } = useParams<{ contest_id: string }>()
  const [contest, setContest] = useState<Contest | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    const fetchContest = async () => {
      setIsLoading(true)
      const contestData = await getContestById(contest_id);
      setContest(contestData.contestData)
      setIsLoading(false)
    }

    fetchContest()
  }, [contest_id])

  useEffect(() => {
    if (contest) {
      const timer = setInterval(() => {
        const now = new Date().getTime()
        const end = new Date(contest.endTime).getTime()
        const distance = end - now

        if (distance < 0) {
          clearInterval(timer)
          setTimeRemaining("Contest Ended")
        } else {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((distance % (1000 * 60)) / 1000)
          setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [contest])

  if (isLoading) {
    return <Loader />
  }

  if (!contest) {
    return <div>Contest not found</div>
  }

  const isContestActive = new Date() >= new Date(contest.startTime) && new Date() < new Date(contest.endTime)
  const isContestEnded = new Date() >= new Date(contest.endTime)

  if (!isAuthenticated && !isContestEnded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p>You must be logged in to view this contest.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{contest.title}</CardTitle>
          {isContestActive && <div className="text-xl font-semibold text-primary">Time Remaining: {timeRemaining}</div>}
          {isContestEnded && (
            <div className="text-xl font-semibold text-muted-foreground">
              Contest Ended: {new Date(contest.endTime).toLocaleString()}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">{contest.description}</p>
          <h2 className="text-2xl font-semibold mb-2">Rules and Regulations:</h2>
          <ul className="list-disc list-inside mb-4">
            <li>All submissions must be your own work.</li>
            <li>You may use any programming language supported by our online judge.</li>
            <li>Plagiarism will result in disqualification.</li>
            <li>The judge's decision is final.</li>
          </ul>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mb-4">Problems:</h2>
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contest.problems.map((problem) => (
          <Card key={problem.id} className={problem.solved ? "bg-green-100 dark:bg-green-900" : ""}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{problem.title}</span>
                <Badge variant={problem.solved ? "success" : "secondary"}>{problem.score} points</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to={`/problems/${problem.id}`}>Solve Problem</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div> */}

      <div className="mt-8 text-center">
        <Button asChild size="lg">
          <Link to={`/contests/${contest_id}/leaderboard`}>View Leaderboard</Link>
        </Button>
      </div>
    </motion.div>
  )
}

export default Contest;