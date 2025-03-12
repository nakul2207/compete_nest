import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useAppSelector } from "@/redux/hook"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader } from "@/components/Loader"
import { getContestById, handleRegistration } from "@/api/contestApi"
import { Calendar, Clock, Trophy, Users, AlertTriangle, ChevronRight, Star, ArrowLeft } from "lucide-react"
import { ContestTimer } from "@/components/ContestTimer"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface Contest {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  status: string
  createdAt: string
  updatedAt: string
  userId: string
  registered: boolean
  participants: number
  problems: {
    id: string
    title: string
    difficulty: string
    score: number
    solved: string[]
  }[]
  server_time: string
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
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const [showEndedPopup, setShowEndedPopup] = useState(false)
  const [timeOffset, setTimeOffset] = useState<number>(0)

  useEffect(() => {
    const fetchContest = async () => {
      setIsLoading(true)
      const contestData = await getContestById(contest_id);
      setContest(contestData)

      // Calculate time offset between server and client
      const serverTimestamp = new Date(contestData.server_time).getTime()
      const clientTimestamp = Date.now()
      setTimeOffset(serverTimestamp - clientTimestamp)
      // if (new Date(contestData.endTime) < new Date()) {
      //   setShowEndedPopup(true);
      // }
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

  // Calculate all times using server-based timing
  const currentServerTime = Date.now() + timeOffset
  const startTime = new Date(contest.startTime).getTime()
  const endTime = new Date(contest.endTime).getTime()

  const isContestActive = currentServerTime >= startTime && currentServerTime < endTime
  const isContestEnded = currentServerTime >= endTime

  const getContestStatus = (): ContestStatus => {
    if (currentServerTime < startTime) {
      return { color: "text-yellow-500", text: "Upcoming" }
    } else if (currentServerTime >= startTime && currentServerTime < endTime) {
      return { color: "text-green-500", text: "In Progress" }
    }
    return { color: "text-red-500", text: "Ended" }
  }

  const getDifficultyConfig = (difficulty: string): DifficultyConfig => {
    if (difficulty === "Easy") {
      return { color: "text-green-500", label: "Easy" }
    } else if (difficulty === "Medium") {
      return { color: "text-yellow-500", label: "Medium" }
    } else {
      return { color: "text-red-500", label: "Hard" }
    }
  };

  if (!isAuthenticated && !isContestEnded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p>You must be logged in to view this contest.</p>
      </div>
    )
  }

  const handleRegister = (contestId: string, isRegister: boolean) => {
    handleRegistration(contestId, isRegister).then((_data) => {
      toast.success(_data.message);
      setContest((prevContest) => {
        if (!prevContest) return null; // Handle undefined state
        return { ...prevContest, registered: !prevContest.registered };
      });

    }).catch((err) => {
      toast.error(`Error in registering: ${err.message}. Please try after sometime.`);
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 max-w-7xl"
    >
      <div className="mb-4">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
          <Link to={`/contests`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Contests
          </Link>
        </Button>
      </div>
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
                timeOffset={timeOffset}  // Pass time offset to timer
                onEnd={() => setShowEndedPopup(true)}
              />
            ) : (
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
              <span>Participants: {contest.participants}</span>
            </div>
          </div>
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {
            (isContestEnded || (isContestActive && contest.registered)) ? (
              contest.problems.map((problem, index) => {
                const difficulty = getDifficultyConfig(problem.difficulty);
                const isSolved = contest.registered && problem.solved.includes(problem.id) || false;
                const cardColor = isSolved ? "bg-green-500" : "bg-primary/10";

                return (
                  <motion.div
                    key={problem.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="max-w-[350px] group hover:border-primary transition-all duration-300 hover:shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-primary ${cardColor}`}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <div className="flex flex-col">

                              <span className="text-lg">{problem.title}</span>
                              <span className={`text-sm ${difficulty.color}`}>
                                {difficulty.label}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={`text-xs`}>
                              {problem.score} points
                            </Badge>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button
                          asChild
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                          <Link to={`/contest/${contest_id}/problem/${problem.id}`} className="flex items-center justify-center gap-2">
                            {isSolved ? "View Problem" : "Solve Problem"}
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              (!isContestActive && !isContestEnded) ? (
                <div className="text-center space-y-4">
                  <p className="text-lg">The contest has not been started yet.</p>
                  <Button
                    variant={contest.registered ? "destructive" : "default"}
                    onClick={() => handleRegister(contest.id, !contest.registered)}
                    className="px-4 py-2"
                  >
                    {contest.registered ? "Unregister" : "Register"}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <Button disabled variant="secondary" className="px-4 py-2">
                    You havn't Registered for this Contest
                  </Button>
                </div>
              )
            )
          }
        </div>
      </div>

      {
        (isContestEnded || (isContestActive && contest.registered)) &&
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg" className="min-w-[200px]">
            <Link to={`/contest/${contest_id}/leaderboard`}
              state={{
                contest: {
                  id: contest.id,
                  title: contest.title,
                  startTime: contest.startTime,
                  endTime: contest.endTime,
                  status: contest.status
                }
              }}
            >
              <Trophy className="w-5 h-5 mr-1" />
              View Leaderboard
            </Link>
          </Button>
        </div>
      }

      <Dialog open={showEndedPopup} onOpenChange={setShowEndedPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Contest Ended</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-lg">
            The contest ended at: {new Date(endTime).toLocaleString()}
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