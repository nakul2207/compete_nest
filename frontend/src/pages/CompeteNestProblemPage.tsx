import {useEffect, useState} from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { ProblemDescription } from "../components/ProblemDescription"
import { CodeEditor } from "../components/CodeEditor"
import { Results } from "../components/Results"
import { Solutions } from "../components/Solutions"
import { Submissions } from "../components/Submissions"
import { CustomTestCases } from "../components/CustomTestCases"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../components/ui/resizable"
import {useParams} from "react-router-dom";
import {getProblemById, getAllExampleTestcases, getFileData, getProblemSubmissions} from "@/api/problemApi.ts";
import {useAppDispatch} from "@/redux/hook.ts";
import {setProblem, setExampleTestcases, setSubmissions} from "@/redux/slice/problemSlice.tsx";

export function CompeteNestProblemPage() {
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [currentTab, setCurrentTab] = useState("description");
  const {problem_id} = useParams();
  const dispatch = useAppDispatch();

  // console.log("render")
  useEffect(() =>{
    const fetchProblem = async () => {
      try {
        const problemData = await getProblemById(problem_id as string);
        dispatch(setProblem(problemData));

        //fetch example testcases psURLs from database
        const testcaseURLs = await getAllExampleTestcases(problem_id as string);
        const input: string[] = await Promise.all(testcaseURLs.input_urls.map((url: string) => getFileData(url)));
        const exp_output: string[] = await Promise.all(testcaseURLs.output_urls.map((url: string) => getFileData(url)));
        dispatch(setExampleTestcases({input, exp_output}));

        //fetching all the submissions of the problem
        const submissions = await getProblemSubmissions(problem_id as string);
        console.log(submissions);
        dispatch(setSubmissions(submissions));
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };

    fetchProblem().then();
  }, [])

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={50} minSize={30}>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full flex flex-col">
            <TabsList className="justify-start border-b px-4 rounded-none">
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
                <Results />
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
                  handleTab={setCurrentTab}
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