import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { ProblemDescription } from "../components/ProblemDescription"
import { CodeEditor } from "../components/CodeEditor"
import { Results } from "../components/Results"
import { Solutions } from "../components/Solutions"
import { Submissions } from "../components/Submissions"
import { CustomTestCases } from "../components/CustomTestCases"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../components/ui/resizable"
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { getProblemById, getAllExampleTestcases, getFileData, getProblemSubmissions } from "@/api/problemApi.ts";
import { useAppDispatch, useAppSelector } from "@/redux/hook.ts";
import { setProblem, setExampleTestcases, setSubmissions } from "@/redux/slice/problemSlice.tsx";
import { Button } from "@/components/ui/button"
import { ArrowLeft, Badge } from "lucide-react"
import { ContestTimer } from "@/components/ContestTimer"
import { Dialog, DialogFooter, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { getContestById } from "@/api/contestApi"
import { Loader } from "@/components/Loader"

interface Contest {
  id: string;
  title: string;
  description: string;
  status: string;
  startTime: string;
  endTime: string;
  problems: string[];
  registered: boolean;
  server_time: string
}

export function CompeteNestProblemPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState("");

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTab, setCurrentTab] = useState("description");
  const [contest, setContest] = useState<Contest | null>(null);
  const { problem_id } = useParams();
  const [showEndedPopup, setShowEndedPopup] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [timeOffset, setTimeOffset] = useState<number>(0);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setIsLoading(true);
        const problemData = await getProblemById(problem_id as string);

        if (user && problemData.contestId) {
          const contest = await getContestById(problemData.contestId);
          if (contest) {
            //calculate time offset between server and client
            const serverTimestamp = new Date(contest.server_time).getTime();
            const clientTimestamp = Date.now();
            setTimeOffset(serverTimestamp - clientTimestamp);

            const currentServerTime = Date.now() + timeOffset;
            const contestStartTime = new Date(contest.startTime).getTime();

            if (contestStartTime <= currentServerTime) {
              if (contest.registered) {
                //check for contest start time
                setContest(contest);
              } else {
                setIsError("You are not registered for this contest");
              }
            } else {
              setIsError("Contest has not started yet");
            }
          }
        }

        dispatch(setProblem(problemData));
        setIsLoading(false);

        //fetch example testcases psURLs from database
        const testcaseURLs = await getAllExampleTestcases(problem_id as string);
        const input: string[] = await Promise.all(testcaseURLs.input_urls.map((url: string) => getFileData(url)));
        const exp_output: string[] = await Promise.all(testcaseURLs.output_urls.map((url: string) => getFileData(url)));
        dispatch(setExampleTestcases({ input, exp_output }));

        //fetching all the submissions of the problem
        const submissions = await getProblemSubmissions(problem_id as string);
        // console.log(submissions);
        dispatch(setSubmissions(submissions));
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };

    fetchProblem().then();
  }, [])

  if (isLoading) {
    return <Loader />
  }

  if (isError !== "") {
    return <Navigate to="/forbidden" state={{ errorMessage: isError }} />
  }

  // Add time-based status calculation
  const getContestStatus = () => {
    if (!contest) return 'Ended';

    const currentServerTime = Date.now() + timeOffset;
    const start = new Date(contest.startTime).getTime();
    const end = new Date(contest.endTime).getTime();

    if (currentServerTime < start) return 'Upcoming';
    if (currentServerTime >= start && currentServerTime < end) return 'In Progress';
    return 'Ended';
  };

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      {
        contest && (
          <div className="px-6 py-2 flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-2 h-2" />
              </Button>

              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {contest.title}
              </div>
            </div>

            {
              getContestStatus() !== 'Ended' ? (
                <div className="text-md">
                  <ContestTimer
                    startTime={contest.startTime}
                    endTime={contest.endTime}
                    timeOffset={timeOffset}  // Pass time offset to timer
                    onEnd={() => setShowEndedPopup(true)}
                  />
                </div>
              )
                : (
                  <Badge className="text-md px-4 py-2 text-red-500">
                    Ended
                  </Badge>
                )
            }
          </div>
        )
      }

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
                {
                  contest && contest.status !== 'Ended' ? (
                    <Solutions show={false} />
                  ) : (
                    <Solutions show={true} />
                  )
                }
              </TabsContent>
              <TabsContent value="submissions">
                <Submissions handleTab={setCurrentTab} />
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

      <Dialog open={showEndedPopup} onOpenChange={setShowEndedPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Contest Ended</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-lg">
            The contest has ended.
          </DialogDescription>
          <DialogFooter className="flex justify-center items-center w-full">
            <Button
              onClick={() => {
                setShowEndedPopup(false);
                navigate(-1);
              }}
              className="mt-4 mx-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}