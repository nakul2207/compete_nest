import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card"
import { Calendar, Clock, FileText } from "lucide-react"
import { Button } from "../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import ContestTimer from "./ui/ContestTimer"

interface Contest {
    id: string
    title: string
    startTime: string
    problems: string[]
    endTime: string
    status: string
    attended: boolean
    server_time: string
}

const ContestCard = ({
    contest,
    isPast = false,
    contestRegister,
}: {
    contest: Contest
    isPast: boolean
    contestRegister: (contestId: string, isRegister: boolean) => void
}) => {
    const navigate = useNavigate()
    const [timeOffset, setTimeOffset] = useState(0)

    const startTime = useMemo(() => new Date(contest.startTime), [contest.startTime])
    const endTime = useMemo(() => new Date(contest.endTime), [contest.endTime])

    useEffect(() => {
        // Calculate server-client time offset
        const serverTimestamp = new Date(contest.server_time).getTime()
        const clientTimestamp = Date.now()
        setTimeOffset(serverTimestamp - clientTimestamp)
    }, [contest.server_time])

    const currentServerTime = Date.now() + timeOffset
    const [contestStarted, setContestStarted] = useState(currentServerTime >= startTime.getTime())
    const [contestEnded, setContestEnded] = useState(currentServerTime >= endTime.getTime())

    const [showPopup, setShowPopup] = useState(false)
    const [popupMessage, setPopupMessage] = useState("")

    console.log(contest.server_time);

    const handleStartTimerExpire = () => {
        setContestStarted(true)
        setPopupMessage("The contest has started!")
        setShowPopup(true)
        if (contest.attended) {
            setTimeout(() => navigate(`/contest/${contest.id}`), 2000)
        }
    }

    const handleEndTimerExpire = () => {
        setContestEnded(true)
        setPopupMessage("The contest has ended!")
        setShowPopup(true)
        setTimeout(() => window.location.reload(), 2000)
    }

    return (
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/20 max-w-[400px]">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
                <CardTitle className="flex justify-between items-center text-lg font-semibold">
                    <span className="truncate mr-2">{contest.title}</span>
                    <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${isPast
                            ? contest.attended
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : !contestStarted
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : !contestEnded
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            }`}
                    >
                        {isPast
                            ? contest.attended
                                ? "Attended"
                                : "Not Attended"
                            : !contestStarted
                                ? "Upcoming"
                                : !contestEnded
                                    ? "Ongoing"
                                    : "Ended"}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>{startTime.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>{contest.problems.length} Questions</span>
                    </div>
                    {/* <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Participants: TBA</span>
                    </div> */}
                </div>
                <div className="mt-6 text-center">
                    <ContestTimer
                        targetTime={!contestStarted ? startTime : !contestEnded ? endTime : null}
                        timeOffset={timeOffset}
                        onExpire={!contestStarted ? handleStartTimerExpire : handleEndTimerExpire}
                        label={!contestStarted ? "Starts in" : !contestEnded ? "Ends in" : "Contest Ended"}
                    />
                </div>
            </CardContent>
            <CardFooter className="bg-muted/50 flex justify-center pt-6">
                {isPast ? (
                    <Button asChild variant="secondary">
                        <a href={`/contest/${contest.id}`}>View Results</a>
                    </Button>
                ) : !contestStarted ? (
                    <div className="flex gap-2">
                        <Button
                            variant={contest.attended ? "destructive" : "default"}
                            onClick={() => contestRegister(contest.id, !contest.attended)}
                        >
                            {contest.attended ? "Unregister" : "Register"}
                        </Button>
                        <Button asChild>
                            <a href={`/contest/${contest.id}`}>View Details</a>
                        </Button>
                    </div>
                ) : contest.attended ? (
                    <Button asChild>
                        <a href={`/contest/${contest.id}`}>Open Contest</a>
                    </Button>
                ) : (
                    <Button disabled variant="secondary">
                        Not Registered
                    </Button>
                )}
            </CardFooter>

            <Dialog open={showPopup} onOpenChange={setShowPopup}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Contest Update</DialogTitle>
                        <DialogDescription>{popupMessage}</DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </Card>
    )
}

export default ContestCard

