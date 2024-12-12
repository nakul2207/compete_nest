import { useState } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"

export function CustomTestCases() {
  const [testCase, setTestCase] = useState("")
  const [output, setOutput] = useState("")

  const runTestCase = () => {
    // This is a mock function. In a real application, you'd send the test case to a backend for execution.
    setOutput("Output for the custom test case will be shown here.")
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Custom Test Cases</h2>
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
        <pre className="bg-muted p-2 rounded-md">{output}</pre>
      </div>
    </div>
  )
}

