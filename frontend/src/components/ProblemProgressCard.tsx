import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { useAppSelector } from "@/redux/hook"
import { Navigate } from "react-router-dom"

interface ProgressItemProps {
    label: string
    solved: string[]
    total: number
    color: string
}

export const ProgressItem: React.FC<ProgressItemProps> = ({ label, solved, total, color }) => {
    const solvedProblems = solved.filter(problem =>
        JSON.parse(problem).type === label
    ).length;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
                <Badge variant="outline" className={`font-mono ${color}`}>
                    {solvedProblems}/{total}
                </Badge>
            </div>
            <Progress
                value={total > 0 ? (solvedProblems / total) * 100 : 0}
                className={`h-3 ${color}`}
            />
        </div>
    );
}

export function ProblemProgressCard({ totalProblems, solved }: { totalProblems: { Easy: number, Medium: number, Hard: number }, solved: string[] }) {
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="w-full max-w-md mx-auto overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <CardTitle className="text-xl font-bold">Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary">
                                {solved.length}/{(totalProblems.Easy + totalProblems.Medium + totalProblems.Hard)}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">Problems Solved</div>
                        </div>

                        <div className="h-32 w-32 mx-auto relative">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle
                                    className="text-muted stroke-current"
                                    strokeWidth="10"
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                />
                                <motion.circle
                                    className="text-primary stroke-current"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: solved.length / (totalProblems.Easy + totalProblems.Medium + totalProblems.Hard) }}
                                    transition={{ duration: 1, ease: "easeInOut" }}
                                    style={{ transformOrigin: "center", rotate: "-90deg" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-primary">
                                {Math.round((solved.length / (totalProblems.Easy + totalProblems.Medium + totalProblems.Hard)) * 100)}%
                            </div>
                        </div>

                        <div className="space-y-4">
                            <ProgressItem label="Easy" solved={solved} total={totalProblems.Easy} color="text-green-500" />
                            <ProgressItem label="Medium" solved={solved} total={totalProblems.Medium} color="text-yellow-500" />
                            <ProgressItem label="Hard" solved={solved} total={totalProblems.Hard} color="text-red-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

