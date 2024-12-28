import { useState, useEffect } from 'react'
import { useAppSelector } from "@/redux/hook"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Check, X, Clock, Copy } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { formatDistanceToNow, format } from 'date-fns'
import { languages } from "@/assets/mapping"
import { cn } from "@/lib/utils"

type Submission = {
    AcceptedTestcases: number;
    createdAt: string;
    evaluatedTestcases: number;
    id: string;
    language: number;
    memory: number;
    problemId: string;
    status: string;
    time: number;
    totalTestcases: number;
    updatedAt: string;
    userCode: string;
    userId: string;
};

type Language = {
    name: string;
    is_archived: boolean;
    boilerplate: string;
};

type LanguageMap = {
    [key: string]: Language;
};

export function Results() {
    const submission: Submission | null = useAppSelector((state) => state.problem.recent_submission)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000)
            return () => clearTimeout(timer)
        }
    }, [copied])

    if (!submission) {
        return (
            <Card className="w-full">
                <CardContent className="pt-6">
                    <div className="text-muted-foreground text-center">No results yet. Run your code to see the results.</div>
                </CardContent>
            </Card>
        )
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Accepted":
                return <Badge variant="success">{status}</Badge>;
            case "Rejected":
                return <Badge variant="destructive">{status}</Badge>;
            case "Time Limit Exceeded":
                return <Badge variant="warning">{status}</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const formatSubmissionTime = (createdAt: string) => {
        const submissionDate = new Date(createdAt)
        const now = new Date()

        if (submissionDate.toDateString() === now.toDateString()) {
            return format(submissionDate, 'HH:mm')
        } else {
            return formatDistanceToNow(submissionDate, { addSuffix: true })
        }
    }

    const getLanguageName = (languageId: number): string => {
        const languageMap: LanguageMap = languages;
        return languageMap[languageId]?.name || "Unknown Language";
    };

    const copyCode = () => {
        navigator.clipboard.writeText(atob(submission.userCode)).then(() => {
            setCopied(true)
        })
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Submission Results</span>
                    {getStatusBadge(submission.status)}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Testcases</p>
                        <p className="text-lg font-semibold">{submission.AcceptedTestcases} / {submission.totalTestcases}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Language</p>
                        <p className="text-lg font-semibold">{getLanguageName(submission.language)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Runtime</p>
                        <p className="text-lg font-semibold">{submission.time} ms</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Memory</p>
                        <p className="text-lg font-semibold">{submission.memory} KB</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Submitted</p>
                        <p className="text-lg font-semibold">{formatSubmissionTime(submission.createdAt)}</p>
                    </div>
                </div>
                <div className="relative mt-6">
                    <SyntaxHighlighter
                        language={getLanguageName(submission.language).toLowerCase()}
                        style={vscDarkPlus}
                        customStyle={{
                            margin: 0,
                            borderRadius: '0.5rem',
                            maxHeight: '300px',
                            overflow: 'auto'
                        }}
                        showLineNumbers
                    >
                        {atob(submission.userCode)}
                    </SyntaxHighlighter>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            "absolute top-2 right-2 transition-all",
                            copied && "bg-green-500 text-white hover:bg-green-600"
                        )}
                        onClick={copyCode}
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Code
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

