import {useCallback, useEffect, useState} from 'react'
import axios from 'axios'
import { Input } from "../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from '@/components/ui/button'
import { useNavigate } from "react-router-dom"
import {getAllProblems, fetchProblems} from "@/api/problemApi.ts"
import { useAppDispatch, useAppSelector} from "@/redux/hook.ts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from 'lucide-react'
import {MultiSelect} from "@/components/ui/multi-select.tsx";
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { setIsAuthenticated,setUser } from '@/redux/slice/authSlice'

interface Company {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  name: string;
}

interface Problem {
  id: string;
  problemId: string,
  title: string;
  difficulty: string;
  topics: Topic[];
  companies: Company[];
  submissions: number;
}

export function ProblemsPage() {
  const server_url = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  // const [totalPages, setTotalPages] = useState(1);
  const [problems, setProblems] = useState<Problem[]>([]);

  const [searchTerm, setSearchTerm] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("All")
  const [topicFilter, setTopicFilter] = useState<Topic[]>([])
  const [companyFilter, setCompanyFilter] = useState<Company[]>([])

  const topics: Topic[]  = useAppSelector((state) => state.topics);
  const companies: Company[]  = useAppSelector((state) => state.companies);

  const dispatch = useAppDispatch();

  const handlePageChange = (page:number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    getAllProblems(currentPage)
        .then((data) => {
        setProblems(data.problems);
    }).catch((error) => {
      console.error("Error fetching problems:", error);
    });
  }, []);

  const handleFilter = async() => {
    const topicIds = topicFilter.map(topic => topic.id);
    const companyIds = companyFilter.map(company => company.id);
    const data = await fetchProblems(searchTerm, difficultyFilter, topicIds, companyIds, currentPage);
    setSearchTerm("");
    setProblems(data.problems);
    // setTotalPages(data.totalPages);
  }

  const handleMultiSelectChange = (
      filterType: "topic" | "company",
      values: (Topic | Company)[]
  ) => {
    if (filterType === "topic") {
      setTopicFilter(values as Topic[]);
    } else {
      setCompanyFilter(values as Company[]);
    }
  };

  const removeFilter = useCallback((filterType: "topic" | "company", value: Topic | Company) => {
    if (filterType === "topic") {
      setTopicFilter(prev => prev.filter(item => item.id !== value.id));
    } else {
      setCompanyFilter(prev => prev.filter(item => item.id !== value.id));
    }
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
              <Select onValueChange={(value) => setDifficultyFilter(value)}>
                <SelectTrigger className="md:w-1/5">
                  <SelectValue placeholder="Difficulty"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Difficulties</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              {/* <Select onValueChange={(value) => setStatusFilter(value)}>
              <SelectTrigger className="md:w-1/5">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Solved">Solved</SelectItem>
                <SelectItem value="Attempted">Attempted</SelectItem>
                <SelectItem value="Unsolved">Unsolved</SelectItem>
              </SelectContent>
            </Select> */}
              <div className="md:w-1/5">
                <MultiSelect
                    options={topics.map(topic => ({id: topic.id, name: topic.name}))}
                    selected={topicFilter.map(topic => topic.id)}
                    onChange={(values) => handleMultiSelectChange('topic', topics.filter(topic => values.includes(topic.id)))}
                    placeholder="Select topics"
                    label="Topics"
                />
              </div>
              <div className="md:w-1/5">
                <MultiSelect
                    options={companies.map(company => ({id: company.id, name: company.name}))}
                    selected={companyFilter.map(company => company.id)}
                    onChange={(values) => handleMultiSelectChange('company', companies.filter(company => values.includes(company.id)))}
                    placeholder="Select companies"
                    label="Companies"
                />
              </div>
              <Button onClick={handleFilter}>Filter</Button>
            </div>
            <div className="border rounded-lg p-4 mb-4">
              <div className="flex flex-wrap gap-2">
                {topicFilter.map(topic => (
                    <div key={topic.name} className="relative inline-block">
                      <button
                          onClick={() => removeFilter('topic', topic)}
                          className="absolute -top-1 -left-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-white text-xs"
                      >
                        <X className="h-3 w-3"/>
                      </button>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-1 rounded-full">
                    {topic.name}
                  </span>
                    </div>
                ))}
                {companyFilter.map(company => (
                    <div key={company.name} className="relative inline-block">
                      <button
                          onClick={() => removeFilter('company', company)}
                          className="absolute -top-1 -left-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-white text-xs"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-1 rounded-full">
                    {company.name}
                  </span>
                    </div>
                ))}
              </div>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Difficulty</TableHead>
                    <TableHead className="font-semibold">Acceptance</TableHead>
                    {/*<TableHead className="font-semibold">Status</TableHead>*/}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {problems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                          No problems found
                        </TableCell>
                      </TableRow>
                  ) : (
                      problems.map((problem) => (
                          <TableRow key={problem.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium cursor-pointer" onClick={() => navigate(`/problems/${problem.problemId}`)}>{problem.title}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                {problem.difficulty}
                              </span>
                            </TableCell>
                            <TableCell>{20}</TableCell>
                            {/*<TableCell>*/}
                            {/*  <span>unsolved</span>*/}
                            {/*</TableCell>*/}
                          </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>

            { !(problems.length === 0 && currentPage === 1) &&
                (
                    <div className="flex justify-center items-center gap-4 mt-6">
                      <Button
                          onClick={() => handlePageChange(currentPage - 1)}
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                      >
                        <ChevronLeftIcon className="h-4 w-4"/>
                      </Button>
                      <span className="font-medium text-sm text-muted-foreground"> Page {currentPage} </span>
                      <Button
                          onClick={() => handlePageChange(currentPage + 1)}
                          variant="outline"
                          size="sm"
                          disabled={problems.length < 10}
                      >
                        <ChevronRightIcon className="h-4 w-4"/>
                      </Button>
                    </div>
                )
            }
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

