import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { useAppSelector } from "../redux/hook.ts"
import { Button } from "./ui/button"
import { Check, X, Clock, Copy } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { languages } from "../assets/mapping.ts";

// Define the type for results
interface ResultsState {
    status: "Accepted" | "Rejected" | "Pending";
    evaluatedTestcases: number;
    totalTestcases: number;
    language: string;
    userCode?: string; // Optional since it might not be present
    createdAt: string;
    updatedAt?: string; // Optional if last updated is not always available
}

export function Results() {
    const results = useAppSelector((state: { problem: { recent_submission: ResultsState | null } }) => state.problem.recent_submission);

    if (!results) {
        return (
            <Card className="w-full">
                <CardContent className="pt-6">
                    <div className="text-muted-foreground text-center">No results yet. Run your code to see the results.</div>
                </CardContent>
            </Card>
        )
    }

    const getStatusIcon = (status: "Accepted" | "Rejected" | "Pending") => {
        switch (status) {
            case "Accepted":
                return <Check className="w-6 h-6 text-green-500" />
            case "Rejected":
                return <X className="w-6 h-6 text-red-500" />
            default:
                return <Clock className="w-6 h-6 text-yellow-500 animate-spin" />
        }
    }

    const getStatusClass = (status: "Accepted" | "Rejected" | "Pending") => {
        switch (status) {
            case "Accepted":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            case "Rejected":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            default:
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        }
    }

    const copyCode = () => {
        if (results.userCode) {
            navigator.clipboard.writeText(atob(results.userCode));
            // You might want to add a toast notification here
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Results</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${getStatusClass(results.status)}`}>
                        {getStatusIcon(results.status)}
                        <span className="ml-2">{results.status}</span>
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Testcases</p>
                        <p className="text-lg font-semibold">{results.evaluatedTestcases} / {results.totalTestcases}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Language</p>
                        <p className="text-lg font-semibold">{languages[results.language as string].name || "Unknown"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Submission Time</p>
                        <p className="text-lg font-semibold">{new Date(results.createdAt).toTimeString()}</p>
                    </div>
                    {/*<div>*/}
                    {/*    <p className="text-sm text-muted-foreground">Last Updated</p>*/}
                    {/*    <p className="text-lg font-semibold">{new Date(results.updatedAt).toLocaleString()}</p>*/}
                    {/*</div>*/}
                </div>
                {
                    results.userCode && (
                        <div className="relative">
                            <SyntaxHighlighter
                                language="cpp"
                                style={vscDarkPlus}
                                customStyle={{
                                    margin: 0,
                                    borderRadius: '0.5rem',
                                    maxHeight: '300px',
                                    overflow: 'auto'
                                }}
                            >
                                {atob(results.userCode)}
                            </SyntaxHighlighter>
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={copyCode}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    )
                }
            </CardContent>
        </Card>
    )
}
