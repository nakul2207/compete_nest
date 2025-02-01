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
import { Calendar, Clock, Trophy, Users, AlertTriangle, ChevronRight, Star, Timer, BarChart } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { ContestTimer } from "@/components/ContestTimer"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

interface ContestStatus {
  color: string
  text: string
}

interface DifficultyConfig {
  color: string;
  label: string;
}

const Contest: React.FC = () => {
  const { contest_id } = useParams<{ contest_id: string }>()
  const [contest, setContest] = useState<Contest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const [showEndedPopup, setShowEndedPopup] = useState(false)

  useEffect(() => {
    const fetchContest = async () => {
      setIsLoading(true)
      const contestData = await getContestById(contest_id);
      setContest(contestData.contestData)
      if (new Date(contestData.contestData.endTime) < new Date()) {
        setShowEndedPopup(true);
      }
      setIsLoading(false)
    }

    fetchContest()
  }, [contest_id])

  if (isLoading) {
    return <Loader />
  }

  if (!contest) {
    return <div>Contest not found</div>
  }

  const isContestActive = new Date() >= new Date(contest.startTime) && new Date() < new Date(contest.endTime)
  const isContestEnded = new Date() >= new Date(contest.endTime)

  const getContestStatus = (): ContestStatus => {
    if (!contest) return { color: "gray", text: "Unknown" }
    
    const now = new Date()
    const start = new Date(contest.startTime)
    const end = new Date(contest.endTime)

    if (now < start) {
      return { color: "text-yellow-500", text: "Upcoming" }
    } else if (now >= start && now < end) {
      return { color: "text-green-500", text: "In Progress" }
    } else {
      return { color: "text-red-500", text: "Ended" }
    }
  }

  const getDifficultyConfig = (index: number): DifficultyConfig => {
    const difficulties = [
      { color: "text-green-500", label: "Easy" },
      { color: "text-yellow-500", label: "Medium" },
      { color: "text-orange-500", label: "Hard" },
      { color: "text-red-500", label: "Expert" },
    ];
    return difficulties[index % difficulties.length];
  };

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
      className="container mx-auto px-4 py-8 max-w-7xl"
    >
      <Card className="mb-8 border-2">
        <CardHeader className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {contest.title}
            </CardTitle>

            {isContestActive ? (
            <ContestTimer 
              startTime={contest.startTime} 
              endTime={contest.endTime}
              onEnd={() => setShowEndedPopup(true)}
            />
          ):(
            <Badge 
              variant="outline" 
              className={`text-lg px-4 py-2 ${getContestStatus().color}`}
            >
              {getContestStatus().text}
            </Badge>
          )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Start: {new Date(contest.startTime).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>End: {new Date(contest.endTime).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span>Problems: {contest.problems.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span>Participants: {/* Add participant count here */}</span>
            </div>
          </div>

          {/* {isContestActive && (
            <ContestTimer 
              startTime={contest.startTime} 
              endTime={contest.endTime} 
            />
          )} */}
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg">{contest.description}</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-primary" />
              Rules and Regulations
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>All submissions must be your own work.</li>
              <li>You may use any programming language supported by our online judge.</li>
              <li>Plagiarism will result in disqualification.</li>
              <li>The judge's decision is final.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-3">
          <Star className="w-8 h-8 text-primary" />
          Problem Set
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {contest.problems.map((problemId, index) => {
            const difficulty = getDifficultyConfig(index);
            return (
              <motion.div
                key={problemId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="group hover:border-primary transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-primary">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-lg">Problem {String.fromCharCode(65 + index)}</span>
                          <span className={`text-sm ${difficulty.color}`}>
                            {difficulty.label}
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        100 points
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      asChild 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      <Link to={`/problems/${problemId}`} className="flex items-center justify-center gap-2">
                        Solve Problem
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Button asChild size="lg" className="min-w-[200px]">
          <Link to={`/contests/${contest_id}/leaderboard`}>
            <Trophy className="w-5 h-5 mr-2" />
            View Leaderboard
          </Link>
        </Button>
      </div>

      <Dialog open={showEndedPopup} onOpenChange={setShowEndedPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Contest Ended</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-lg">
            The contest has ended.
          </DialogDescription>
          <DialogFooter className="flex justify-center items-center w-full">
            <Button 
              onClick={() => setShowEndedPopup(false)}
              className="mt-4 mx-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export default Contest;