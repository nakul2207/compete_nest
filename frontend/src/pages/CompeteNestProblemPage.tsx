import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { ProblemDescription } from "../components/ProblemDescription"
import { CodeEditor } from "../components/CodeEditor"
import { Results } from "../components/Results"
import { Solutions } from "../components/Solutions"
import { Submissions } from "../components/Submissions"
import { CustomTestCases } from "../components/CustomTestCases"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../components/ui/resizable"
import {useAppSelector, useAppDispatch} from "../redux/hook.ts";
import {createSubmission, runProblem} from "../api/problemApi.ts";
import {setCodeOutputs} from "../redux/slice/problemSlice.tsx";

export function CompeteNestProblemPage() {
  const [results, setResults] = useState<{
    status: string;
    runtime: string;
    memory: string;
  } | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [currentTab, setCurrentTab] = useState("description");
  const problem  = useAppSelector((state) => state.problem);
  const dispatch = useAppDispatch();

  console.log("Problem page re render");

  const runCode = async () => {
    try {
      // Prepare a new array for storing results
      const updatedOutputs = [...problem.code_outputs];

      await Promise.all(
          problem.example_inputs.map(async (inputValue, index) => {
            // Prepare the data for submission
            const data = {
              source_code: btoa(problem.code), // Encode source code in Base64
              language_id: problem.languageId,
              stdin: btoa(inputValue), // Encode stdin in Base64
              expected_output: btoa(problem.example_exp_outputs[index]), // Encode expected output
            };

            // Create submission and await the result
            const result = await createSubmission(data);

            // Parse the result and update output
            if (result.status.id === 3 || result.stdout) {
              // Success: Decode stdout and store
              updatedOutputs[index] = { status: result.status.description, output: atob(result.stdout) };
            } else {
              // Failure: Store error description
              updatedOutputs[index] = { status: result.status.description, output: null };
            }
          })
      );

      // Update the outputs in state after processing all submissions
      dispatch(setCodeOutputs(updatedOutputs));
      setCurrentTab("testcases"); // Change tab after all submissions are processed
    } catch (error) {
      console.error("Error processing submissions:", error);
    }
  };

  const submitCode = () => {
    setCurrentTab("results");
  }

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={50} minSize={30}>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full flex flex-col">
            <TabsList className="justify-start border-b px-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="solutions">Solutions</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="testcases">Test Cases</TabsTrigger>
            </TabsList>
            <div className="flex-grow overflow-auto p-4">
              <TabsContent value="description">
                <ProblemDescription />
              </TabsContent>
              <TabsContent value="results">
                <Results results={results} />
              </TabsContent>
              <TabsContent value="solutions">
                <Solutions />
              </TabsContent>
              <TabsContent value="submissions">
                <Submissions />
              </TabsContent>
              <TabsContent value="testcases">
                <CustomTestCases />
              </TabsContent>
            </div>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="relative h-full">
            <div className={`${isFullScreen ? 'fixed inset-0 z-50 bg-background' : 'h-full'}`}>
              <CodeEditor
                runCode={runCode}
                submitCode={submitCode}
                isFullScreen={isFullScreen}
                handleFullScreen={setIsFullScreen}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}