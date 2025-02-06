import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useAppSelector } from "@/redux/hook"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader } from "@/components/Loader"
import { Trophy, User, Clock, ArrowLeft, Medal, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getLeaderboard } from "@/api/contestApi"

interface Participant {
    userId: string
    user: {
        name: string
    }
    score: number
    problemsSolved: String[]
    rank?: number

}

export function LeaderBoard() {
    const { contest_id } = useParams<{ contest_id: string }>()
    const [participants, setParticipants] = useState<Participant[]>([])
    const [currentUser, setCurrentUser] = useState<Participant | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { user } = useAppSelector((state) => state.auth)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const itemsPerPage = 10

    useEffect(() => {
        setIsLoading(true);
        getLeaderboard(contest_id).then((leaderboard) => {
            console.log(leaderboard);
            setParticipants(leaderboard);
            setTotalPages(Math.ceil(leaderboard.length / itemsPerPage));
            setCurrentUser(leaderboard.find((participant: Participant, index: number) => {
                if (participant.userId === user?.id) {
                    participant.rank = index + 1;
                    return true;
                }
                return false;
            }));
        });
        setIsLoading(false);
    }, []) // Added currentPage to dependencies

    const getRankBadge = (rank: number) => {
        switch (rank) {
            case 1:
                return <Medal className="h-5 w-5 text-yellow-500" />
            case 2:
                return <Medal className="h-5 w-5 text-gray-400" />
            case 3:
                return <Medal className="h-5 w-5 text-amber-600" />
            default:
                return <span className="font-mono text-sm text-muted-foreground">#{rank}</span>
        }
    }

    if (isLoading) return <Loader />

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6">
                <div className="mb-6">
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
                        <Link to={`/contest/${contest_id}`}>
                            <ArrowLeft className="h-4 w-4" />
                            Back to Contest
                        </Link>
                    </Button>
                </div>

                <Card className="border-primary/20">
                    <CardHeader className="border-b bg-muted/50">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <Trophy className="h-6 w-6 text-primary" />
                                Leaderboard
                            </CardTitle>
                            <Badge variant="secondary" className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Live Updates
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        {currentUser && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                                <Card className="bg-primary/5 border-primary/20">
                                    <CardContent className="p-4">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-full bg-primary/10">
                                                    <User className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{currentUser.user.name}</h3>
                                                    <p className="text-sm text-muted-foreground">Current Rank: {currentUser.rank}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge variant="default" className="text-lg px-3 py-1">
                                                    {currentUser.score} Points
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {currentUser.problemsSolved.length} Problems Solved
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
                            <div className="space-y-3">
                                {participants
                                    .map((participant, index) => {
                                        const rank = index + 1;
                                        if (index < (currentPage - 1) * itemsPerPage || index >= currentPage * itemsPerPage) {
                                            return null;
                                        }
                                        return (
                                            <motion.div
                                                key={`${participant.userId}-${participant.score}-${participant.problemsSolved}`}
                                                initial={{ rotateX: -90 }}
                                                animate={{ rotateX: 0 }}
                                                exit={{ rotateX: 90 }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <Card
                                                    className={cn(
                                                        "transition-all hover:shadow-md",
                                                        participant.userId === currentUser?.userId ? "border-primary/50 bg-primary/5" : ""
                                                    )}
                                                >
                                                    <CardContent className="p-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 flex justify-center">{getRankBadge(rank)}</div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">
                                                                        {participant.user.name}
                                                                        {participant.userId === currentUser?.userId && (
                                                                            <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                                                                        )}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">{participant.problemsSolved.length} Solved</span>
                                                                </div>
                                                            </div>
                                                            <Badge variant="secondary" className="font-mono text-xs">
                                                                {participant.score} pts
                                                            </Badge>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        )
                                    })
                                }
                            </div>
                        </ScrollArea>

                        <div className="flex items-center justify-between mt-6">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// Utility function for conditional className merging
function cn(...classes: string[]) {
    return classes.filter(Boolean).join(" ")
}