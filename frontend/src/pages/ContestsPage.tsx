import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { getAllContests, handleRegistration } from "@/api/contestApi.ts"
import { Spinner } from "../components/ui/Spinner"
import { toast } from "sonner"
import ContestCard from "@/components/ContestCard"
import { Calendar, Clock, Check, X } from "lucide-react"

interface Contest {
  id: string
  title: string
  startTime: string
  problems: string[]
  participants: number
  endTime: string
  status: string
  attended: boolean
  server_time: string
}

export function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    getAllContests()
      .then((data) => {
        setContests(data.contests)
        setLoading(false)
      })
      .catch((err) => {
        toast.error(`Error in fetching contest ${err.message}`)
        setLoading(false)
      })
  }, [])

  const handleRegister = (contestId: string, isRegister: boolean) => {
    handleRegistration(contestId, isRegister)
      .then((_data) => {
        toast.success(_data.message)
        setContests((prevContests) =>
          prevContests.map((contest) => (contest.id === contestId ? { ...contest, attended: isRegister } : contest)),
        )
      })
      .catch((err) => {
        toast.error(`Error in registering: ${err.message}. Please try after sometime.`)
      })
  }

  const upcomingContests = contests.filter((contest) => contest.status !== "Ended")
  const pastContests = contests.filter((contest) => {
    if (filter === "attended") {
      return contest.status === "Ended" && contest.attended
    } else if (filter === "not-attended") {
      return contest.status === "Ended" && !contest.attended
    } else {
      return contest.status === "Ended"
    }
  })

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Upcoming Contests Section */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Upcoming Contests</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : (
          <>
            {upcomingContests.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingContests.map((contest) => (
                  <ContestCard key={contest.id} contest={contest} isPast={false} contestRegister={handleRegister} />
                ))}
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-10 text-center">
                <p className="text-lg text-muted-foreground font-medium">
                  No upcoming contests found yet. Check back later!
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Past Contests Section */}
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold">Past Contests</h2>
          <Select onValueChange={setFilter} defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter contests" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contests</SelectItem>
              <SelectItem value="attended">Attended</SelectItem>
              <SelectItem value="not-attended">Not Attended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : (
          <>
            {pastContests.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">S.No</TableHead>
                      <TableHead>Contest Name</TableHead>
                      <TableHead className="hidden md:table-cell">Date & Time</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastContests.map((contest, index) => (
                      <TableRow key={contest.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{contest.title}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-col text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar className="mr-2 h-3 w-3" />
                              {new Date(contest.startTime).toLocaleDateString()}
                            </span>
                            <span className="flex items-center mt-1">
                              <Clock className="mr-2 h-3 w-3" />
                              {new Date(contest.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {contest.attended ? (
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <Check className="mr-1 h-3 w-3" />
                              Attended
                            </div>
                          ) : (
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              <X className="mr-1 h-3 w-3" />
                              Not Attended
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => navigate(`/contest/${contest.id}`)}
                            className="text-primary hover:underline text-sm font-medium"
                          >
                            View Results
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-10 text-center">
                <p className="text-lg text-muted-foreground font-medium">No past contests found.</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}