import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { useAppSelector } from "../redux/hook.ts"
import { createSubmission } from "../api/problemApi.ts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { ScrollArea } from "./ui/scroll-area"
import { Loader } from "lucide-react"

// Define the type for codeOutput
type CodeOutput = {
    status: string;
    output: string | null;
};

export function CustomTestCases() {
    const [testCase, setTestCase] = useState("")
    const [output, setOutput] = useState("")
    const problem = useAppSelector((state) => state.problem)
    const [IsRunning,setIsRunning] = useState(false);

    useEffect(() => {
        // console.log("Testcase tab is triggered")
    }, [])

    const runTestCase = async () => {
        if (problem.code === "") {
            setOutput("Please provide code")
            return
        }

        if (testCase === "") {
            setOutput("Please provide input first")
            return
        }
        setIsRunning(true);
        setOutput("Running code...")

        const data = {
            source_code: btoa(problem.code),
            language_id: problem.languageId,
            stdin: btoa(testCase)
        }

        try {
            const result = await createSubmission(data)

            if(result.status.id === 3){
                setOutput(atob(result.stdout))
            } else {
                const decodedOutput = new TextDecoder("utf-8").decode(
                    Uint8Array.from(atob(result.compile_output), (c) => c.charCodeAt(0))
                  );
                setOutput(result.status.description+"\n"+decodedOutput)
            }

        } catch (error) {
            setOutput("Error running code: " + (error instanceof Error ? error.message : String(error)))
        }finally{
            setIsRunning(false);
        }
    }

    const getStatusIcon = (codeOutput: CodeOutput | null, expectedOutput: string) => {
        if (!codeOutput) return null;

        const trimmedOutput = codeOutput.output?.trim();
        const trimmedExpected = expectedOutput.trim();

        if (trimmedOutput === trimmedExpected) {
            return <CheckCircle2 className="text-green-500" />;
        } else if (codeOutput.status === "Time Limit Exceeded") {
            return <AlertCircle className="text-yellow-500" />;
        } else {
            return <XCircle className="text-red-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Example Test Cases</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="example0" className="w-full">
                        <ScrollArea className="h-[60px]">
                            <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                                {problem.example_inputs.map((_, index) => (
                                    <TabsTrigger
                                        key={index}
                                        value={`example${index}`}
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                                    >
                                        Example {index + 1}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </ScrollArea>
                        {problem.example_inputs.map((input, index) => (
                            <TabsContent key={index} value={`example${index}`} className="mt-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Input:</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <pre className="bg-muted p-2 rounded-md overflow-x-auto">{input}</pre>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Expected Output:</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <pre className="bg-muted p-2 rounded-md overflow-x-auto">{problem.example_exp_outputs[index]}</pre>
                                        </CardContent>
                                    </Card>
                                </div>
                                {problem.code_outputs[index] && (
                                    <Card className="mt-4">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                Code Output:
                                                {getStatusIcon(problem.code_outputs[index] as CodeOutput, problem.example_exp_outputs[index])}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                                                {(problem.code_outputs[index] as CodeOutput).output || (problem.code_outputs[index] as CodeOutput).status}
                                            </pre>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Custom Test Cases</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="testcase" className="block text-sm font-medium text-muted-foreground mb-2">
                                Input:
                            </label>
                            <Textarea
                                id="testcase"
                                value={testCase}
                                onChange={(e) => setTestCase(e.target.value)}
                                placeholder="Enter your test case here..."
                                rows={4}
                                className="w-full resize-none"
                            />
                        </div>
                        <Button onClick={runTestCase} disabled={IsRunning} className="min-w-[150px]">
                            {
                                IsRunning? <Loader className="animate-spin h-4 w-4" /> : "Run Test Case"
                            }
                            </Button>
                        <div>
                            <h3 className="text-lg font-medium mb-2">Output:</h3>
                            <pre className="bg-muted p-2 rounded-md overflow-x-auto min-h-[100px]">{output}</pre>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

