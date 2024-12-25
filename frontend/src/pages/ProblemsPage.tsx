import {useEffect, useState} from 'react'
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import {getAllProblems} from "@/api/problemApi.ts";

const dummyProblems = [
  { id: 1, title: "Two Sum", difficulty: "Easy", acceptance: "45%", status: "Solved", topic: "Array", company: "Amazon" },
  { id: 2, title: "Add Two Numbers", difficulty: "Medium", acceptance: "35%", status: "Attempted", topic: "Linked List", company: "Microsoft" },
  { id: 3, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", acceptance: "30%", status: "Unsolved", topic: "String", company: "Google" },
  { id: 4, title: "Median of Two Sorted Arrays", difficulty: "Hard", acceptance: "25%", status: "Unsolved", topic: "Array", company: "Apple" },
  { id: 5, title: "Longest Palindromic Substring", difficulty: "Medium", acceptance: "28%", status: "Solved", topic: "String", company: "Facebook" },
]

const topics = ["Array", "String", "Linked List", "Tree", "Dynamic Programming"]
const companies = ["Amazon", "Google", "Microsoft", "Apple", "Facebook"]

export function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [topicFilter, setTopicFilter] = useState("All")
  const [companyFilter, setCompanyFilter] = useState("All")

  const filteredProblems = dummyProblems.filter(problem =>
    problem.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (difficultyFilter === "All" || problem.difficulty === difficultyFilter) &&
    (statusFilter === "All" || problem.status === statusFilter) &&
    (topicFilter === "All" || problem.topic === topicFilter) &&
    (companyFilter === "All" || problem.company === companyFilter)
  )

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const allProblems = await getAllProblems();
        console.log(allProblems);
        setProblems(allProblems);
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };

    fetchProblems();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/4">
          <h1 className="text-3xl font-bold mb-6">Problems</h1>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-1/3"
            />
            <Select onValueChange={setDifficultyFilter}>
              <SelectTrigger className="md:w-1/5">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Difficulties</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setStatusFilter}>
              <SelectTrigger className="md:w-1/5">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Solved">Solved</SelectItem>
                <SelectItem value="Attempted">Attempted</SelectItem>
                <SelectItem value="Unsolved">Unsolved</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setTopicFilter}>
              <SelectTrigger className="md:w-1/5">
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Topics</SelectItem>
                {topics.map(topic => (
                  <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setCompanyFilter}>
              <SelectTrigger className="md:w-1/5">
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Companies</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company} value={company}>{company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold">Difficulty</TableHead>
                  <TableHead className="font-semibold">Acceptance</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {problems.map((problem) => (
                  <TableRow key={problem.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{problem.title}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {problem.difficulty}
                      </span>
                    </TableCell>
                    <TableCell>{20}</TableCell>
                    <TableCell>
                      {/*<span className={`px-2 py-1 rounded-full text-xs font-semibold*/}
                      {/*   ${problem.status === 'Solved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :*/}
                      {/*     problem.status === 'Attempted' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :*/}
                      {/*     'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>*/}
                      {/*  {problem.status}*/}
                      {/*</span>*/}
                      <span>unsolved</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Problems Solved:</span>
                  <span className="font-semibold">2/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Easy:</span>
                  <span className="font-semibold">1/1</span>
                </div>
                <div className="flex justify-between">
                  <span>Medium:</span>
                  <span className="font-semibold">1/3</span>
                </div>
                <div className="flex justify-between">
                  <span>Hard:</span>
                  <span className="font-semibold">0/1</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}