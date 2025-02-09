import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { formatDistanceToNow, format } from "date-fns";
import { languages, statuses } from "@/assets/mapping";
import { setRecentSubmission } from "@/redux/slice/problemSlice.tsx";

type Language = {
  name: string;
  is_archived: boolean;
  boilerplate: string;
};

type LanguageMap = {
  [key: string]: Language;
};

type Submission = {
  acceptedTestcases: number;
  createdAt: string;
  evaluatedTestcases: number;
  id: string;
  language: number;
  memory: number;
  problemId: string;
  status: number;
  time: number;
  totalTestcases: number;
  updatedAt: string;
  userCode: string;
  userId: string;
};

interface SubmissionsProps {
  handleTab: (currentTab: string) => void;
}

export function Submissions({ handleTab }: SubmissionsProps) {
  const {user} = useAppSelector((state) => state.auth);

  const submissions: Submission[] = useAppSelector(
      (state) => state.problem.submissions
  );
  const dispatch = useAppDispatch();

  const getStatusBadge = (status: number) => {
    if (status <= 2) {
      return <Badge variant="secondary">{statuses[status]}</Badge>;
    } else if (status === 3) {
      return <Badge variant="success">{statuses[status]}</Badge>;
    } else {
      return <Badge variant="destructive">{statuses[status]}</Badge>;
    }
  };

  const formatSubmissionTime = (createdAt: string) => {
    const submissionDate = new Date(createdAt);
    const now = new Date();

    if (submissionDate.toDateString() === now.toDateString()) {
      return format(submissionDate, "HH:mm");
    } else {
      return formatDistanceToNow(submissionDate, { addSuffix: true });
    }
  };

  const getLanguageName = (languageId: number): string => {
    const languageMap: LanguageMap = languages;
    return languageMap[languageId]?.name || "Unknown Language";
  };

  const handleShowSubmission = (index: number) => {
    dispatch(setRecentSubmission(submissions[index]));
    handleTab("results");
  };

  if(!user){
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">Please login to view submissions</p>
      </div>
    )
  }

  return (
    <>
    {
      submissions.length === 0 ? (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">No submissions found</p>
      </div>
    ):(
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-16rem)] w-full">
            
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Runtime</TableHead>
                    <TableHead>Memory</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {
                  submissions.map((submission, index) => (
                      <TableRow
                          key={submission.id}
                          onClick={() => handleShowSubmission(index)} // Fixed onClick function
                          className="cursor-pointer"
                      >
                        <TableCell>{getStatusBadge(submission.status)}</TableCell>
                        <TableCell>
                          {submission.time ? `${submission.time}s` : "N/A"}
                        </TableCell>
                        <TableCell>
                          {submission.memory ? `${submission.memory} KB` : "N/A"}
                        </TableCell>
                        <TableCell>{getLanguageName(submission.language)}</TableCell>
                        <TableCell>
                          {formatSubmissionTime(submission.createdAt)}
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            
          </ScrollArea>
        </CardContent>
      </Card>
    )
  }
  </>
  );
}

