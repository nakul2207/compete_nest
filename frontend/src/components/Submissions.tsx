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
import { languages } from "@/assets/mapping";
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
  AcceptedTestcases: number;
  createdAt: string;
  evaluatedTestcases: number;
  id: string;
  language: number;
  memory: number;
  problemId: string;
  status: string;
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
  const submissions: Submission[] = useAppSelector(
      (state) => state.problem.submissions
  );
  const dispatch = useAppDispatch();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Accepted":
        return <Badge variant="success">{status}</Badge>;
      case "Rejected":
        return <Badge variant="destructive">{status}</Badge>;
      case "Time Limit Exceeded":
        return <Badge variant="warning">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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

  return (
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
                {submissions.map((submission, index) => (
                    <TableRow
                        key={submission.id}
                        onClick={() => handleShowSubmission(index)} // Fixed onClick function
                        className="cursor-pointer"
                    >
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        {submission.time ? `${submission.time} ms` : "N/A"}
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
  );
}
