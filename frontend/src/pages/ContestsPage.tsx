import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Calendar, Clock } from 'lucide-react'
import {getAllContests, handleRegistration} from "@/api/contestApi.ts";
import { Link } from 'react-router-dom'

interface Contest {
  id: string;
  title: string;
  startTime: string;
  problems: string[];
  participants: number;
  endTime: string;
  status: string;
  attended: boolean;
}

export function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getAllContests().then((data) => {
      console.log(data);
      setContests(data.contests);
    }).catch((err) => console.log(err))
  }, [])

  const handleRegister = (contestId: string, isRegister: boolean) => {
    handleRegistration(contestId, isRegister).then((data) => {
      console.log(data);
      setContests(prevContests => prevContests.map(contest => contest.id === contestId ? { ...contest, attended: isRegister } : contest));
    }).catch((err) => console.log(err))
  }

  const ContestCard = ({ contest, isPast = false }: { contest: Contest, isPast: boolean }) => {
    const date = new Date(contest.startTime);

    return (<Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{contest.title}</span>
          {isPast ? (
              <span
                  className={`text-sm px-2 py-1 rounded ${contest.attended ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
              {contest.attended ? 'Attended' : 'Not Attended'}
            </span>
          )
          : (
            date > new Date() ? (
              <span className="text-sm px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Upcoming
              </span>
            ) : (
              <span className="text-sm px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Ongoing
              </span>
            )
          )
        }
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4"/>
            <span>{date.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4"/>
            <span>{date.toLocaleTimeString()}</span>
          </div>
          {/* <div className="flex items-center">
            <Users className="mr-2 h-4 w-4"/>
            <span>{contest.participants.toLocaleString()} participants</span>
          </div> */}
          <div>
            <span>{contest.problems.length} questions</span>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          {isPast ? (
            <Link to={`/contest/${contest.id}`}>
              <Button>
                View Results
              </Button>
            </Link>
          ) : (
            date > new Date() ? (
              <Button 
                variant={contest.attended ? "destructive" : "default"}
                onClick={() => { handleRegister(contest.id, !contest.attended) }}
              >
                {contest.attended ? 'Unregister' : 'Register'}
              </Button>
            ) : (
              contest.attended ? (
                <Link to={`/contest/${contest.id}`}>
                  <Button>
                    Open
                </Button>
              </Link>):(
                <Button disabled>
                  You are not registered for this contest
                </Button>
              )
            )
          )}
        </div>
      </CardContent>
    </Card>)
  }

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
            {contests
              .filter(contest => contest.status !== 'Ended')
              .map(contest => (
                <ContestCard key={contest.id} contest={contest} isPast={false}/>
              ))
            }
          </div>
        </TabsContent>
        <TabsContent value="past">
          <div className="mb-4">
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contests
              .filter(contest => {
                if (filter === 'attended') {
                  return contest.status === 'Ended' && contest.attended;
                } else if (filter === 'not-attended') {
                  return contest.status === 'Ended' && !contest.attended;
                } else {
                  return contest.status === 'Ended';
                }
              })
              .map(contest => (
                <ContestCard key={contest.id} contest={contest} isPast={true}/>
              ))
            }
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}