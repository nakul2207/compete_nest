import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Calendar, Clock, Users } from 'lucide-react'

// Dummy data for contests
const futureContests = [
  { id: 1, name: "Weekly Contest 342", date: "2023-07-15", time: "20:00 UTC", duration: "1.5 hours", participants: 10000, questions: 4 },
  { id: 2, name: "Biweekly Contest 105", date: "2023-07-22", time: "14:00 UTC", duration: "2 hours", participants: 8000, questions: 5 },
  { id: 3, name: "Monthly Contest 18", date: "2023-08-01", time: "18:00 UTC", duration: "3 hours", participants: 15000, questions: 6 },
]

const pastContests = [
  { id: 4, name: "Weekly Contest 341", date: "2023-07-08", time: "20:00 UTC", duration: "1.5 hours", participants: 12000, questions: 4, attended: true },
  { id: 5, name: "Biweekly Contest 104", date: "2023-07-01", time: "14:00 UTC", duration: "2 hours", participants: 9000, questions: 5, attended: false },
  { id: 6, name: "Monthly Contest 17", date: "2023-06-15", time: "18:00 UTC", duration: "3 hours", participants: 14000, questions: 6, attended: true },
]

export function ContestsPage() {
  const [pastContestFilter, setPastContestFilter] = useState("all")

  const filteredPastContests = pastContests.filter(contest => 
    pastContestFilter === "all" || 
    (pastContestFilter === "attended" && contest.attended) ||
    (pastContestFilter === "not-attended" && !contest.attended)
  )

  const ContestCard = ({ contest, isPast = false }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{contest.name}</span>
          {isPast && (
            <span className={`text-sm px-2 py-1 rounded ${contest.attended ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
              {contest.attended ? 'Attended' : 'Not Attended'}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{contest.date}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            <span>{contest.time} ({contest.duration})</span>
          </div>
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span>{contest.participants.toLocaleString()} participants</span>
          </div>
          <div>
            <span>{contest.questions} questions</span>
          </div>
        </div>
        <Button className="w-full mt-4">
          {isPast ? 'View Results' : 'Register'}
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Contests</h1>
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming Contests</TabsTrigger>
          <TabsTrigger value="past">Past Contests</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {futureContests.map(contest => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="past">
          <div className="mb-4">
            <Select onValueChange={setPastContestFilter} defaultValue="all">
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPastContests.map(contest => (
              <ContestCard key={contest.id} contest={contest} isPast={true} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}