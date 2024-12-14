import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { useAppSelector } from "../redux/hook.ts"
import { createSubmission, getSubmission } from "../api/problemApi.ts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

// Define the type for codeOutput
type CodeOutput = {
    status: string;
    output: string | null;
};

export function CustomTestCases() {
    const [testCase, setTestCase] = useState("")
    const [output, setOutput] = useState("")
    const problem = useAppSelector((state) => state.problem)

    useEffect(() => {
        console.log("Testcase tab is triggered")
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
                setOutput(result.status.description)
            }

        } catch (error) {
            setOutput("Error running code: " + error.message)
        }
    }

    const getStatusIcon = (codeOutput: CodeOutput | null, expectedOutput: string) => {
        if (!codeOutput) return null; // Handle null/undefined codeOutput gracefully

        const trimmedOutput = codeOutput.output?.trim();
        const trimmedExpected = expectedOutput.trim();

        if (trimmedOutput === trimmedExpected) {
            // Output matches expected output
            return <CheckCircle2 className="text-green-500" />;
        } else if (codeOutput.status === "Time Limit Exceeded") {
            // Time limit exceeded
            return <AlertCircle className="text-yellow-500" />;
        } else {
            // Output mismatch or other error
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
                        <TabsList className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {problem.example_inputs.map((_, index) => (
                                <TabsTrigger key={index} value={`example${index}`}>
                                    Example {index + 1}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {problem.example_inputs.map((input, index) => (
                            <TabsContent key={index} value={`example${index}`}>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h3 className="font-semibold mb-2">Input:</h3>
                                        <pre className="bg-muted p-2 rounded-md overflow-x-auto">{input}</pre>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Expected Output:</h3>
                                        <pre className="bg-muted p-2 rounded-md overflow-x-auto">{problem.example_exp_outputs[index]}</pre>
                                    </div>
                                </div>
                                {problem.code_outputs[index] && (
                                    <div className="mt-4">
                                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                                            Code Output:
                                            {getStatusIcon(problem.code_outputs[index], problem.example_exp_outputs[index])}
                                        </h3>
                                        <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                                            {problem.code_outputs[index].output || problem.code_outputs[index].status}
                                        </pre>
                                    </div>
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
                            />
                        </div>
                        <Button onClick={runTestCase}>Run Test Case</Button>
                        <div>
                            <h3 className="text-lg font-medium mb-2">Output:</h3>
                            <pre className="bg-muted p-2 rounded-md overflow-x-auto">{output}</pre>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

