import { useState } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import {useAppSelector} from "../redux/hook.ts";
import {createSubmission, getSubmission} from "../api/problemApi.ts";

export function CustomTestCases() {
    const code =  useAppSelector((state) => state.problem.code);
    const languageId = useAppSelector((state) => state.problem.languageId)
  const [testCase, setTestCase] = useState("")
  const [output, setOutput] = useState("")

    const runTestCase = async () => {
        if (code === "") {
            setOutput("Please provide code");
            return;
        }

        if (testCase === "") {
            setOutput("Please provide input first");
            return;
        }

        // Set output to indicate the code is running
        setOutput("Running code...");

        // Prepare the data for submission
        const data = {
            source_code: btoa(code),
            language_id: languageId,
            stdin: btoa(testCase)
        };

        try {
            // Create a submission and wait for the result
            const result = await createSubmission(data);

            // Display the output from the submission result
            if(result.status.id === 3){
                setOutput(atob(result.stdout));
            }else{
                setOutput(result.status.description);
            }

        } catch (error) {
            // Handle errors, if any
            setOutput("Error running code: " + error.message);
        }
    };


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

