import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { ProblemDescription } from "../components/ProblemDescription"
import { CodeEditor } from "../components/CodeEditor"
import { Results } from "../components/Results"
import { Solutions } from "../components/Solutions"
import { Submissions } from "../components/Submissions"
import { CustomTestCases } from "../components/CustomTestCases"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../components/ui/resizable"

export function CompeteNestProblemPage() {
  const [code, setCode] = useState("")
  const [results, setResults] = useState<{
    status: string;
    runtime: string;
    memory: string;
  } | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const runCode = () => {
    setResults({
      status: "Accepted",
      runtime: "52 ms",
      memory: "41.8 MB",
    })
  }

  const submitCode = () => {
    console.log("Code submitted:", code)
  }

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={50} minSize={30}>
          <Tabs defaultValue="description" className="h-full flex flex-col">
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
                code={code}
                setCode={setCode}
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