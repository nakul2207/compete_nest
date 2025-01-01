import {useEffect, useState} from 'react'
import { Input } from "../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from '@/components/ui/button'
import { useNavigate } from "react-router-dom"
import {getAllProblems, fetchProblems} from "@/api/problemApi.ts"
import { useAppSelector} from "@/redux/hook.ts"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from 'lucide-react'

interface Company {
  id: string;
  name: string;
}
interface Topic {
  id: string;
  name: string;
}

// const topics = ["Array", "String", "Linked List", "Tree", "Dynamic Programming"]
// const companies = ["Amazon", "Google", "Microsoft", "Apple", "Facebook"]

export function ProblemsPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [problems, setProblems] = useState([]);

  const [searchTerm, setSearchTerm] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("All")
  const [topicFilter, setTopicFilter] = useState<Topic[]>([])
  const [companyFilter, setCompanyFilter] = useState<Company[]>([])

  const topics: Topic[]  = useAppSelector((state) => state.topics);
  const companies: Company[]  = useAppSelector((state) => state.companies);

  const handlePageChange = (page:number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const allProblems = await getAllProblems(currentPage);
        setProblems(allProblems.problems);
        setTotalPages(allProblems.totalPages);
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };

    fetchProblems().then();
  }, []);

  const handlefilter = async() => {
    const topicIds = topicFilter.map(topic => topic.id);
    const companyIds = companyFilter.map(company => company.id);
    const data = await fetchProblems(searchTerm, difficultyFilter, topicIds, companyIds, currentPage);
    setSearchTerm("");
    setProblems(data.problems);
    setTotalPages(data.totalPages);
  }

  const handleFilterChange = (
      filterType: "topic" | "company",
      value: { id: string; name: string }
  ) => {
    const setFilter = {
      topic: setTopicFilter,
      company: setCompanyFilter,
    }[filterType];

    // Toggle the object in the filter array
    setFilter(prev =>
        prev.some(item => item.id === value.id)
            ? prev.filter(item => item.id !== value.id) // Remove if already in the filter
            : [...prev, value] // Add the new object if not present
    );
  };

  const removeFilter = (
      filterType: "topic" | "company",
      value: { id: string; name: string }
  ) => {
    const setFilter = {
      topic: setTopicFilter,
      company: setCompanyFilter,
    }[filterType];

    // Remove the object with the matching id from the filter array
    setFilter(prev => prev.filter(item => item.id !== value.id));
  };

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
                  <SelectValue placeholder="Difficulty" />
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="md:w-1/5">Topic</Button>
                </PopoverTrigger>
                <PopoverContent>
                  {topics.map(topic=> (
                      <div key={topic.name} className="flex items-center space-x-2">
                        <Checkbox
                            id={`topic-${topic.name}`}
                            checked={topicFilter.includes(topic)}
                            onCheckedChange={() => handleFilterChange('topic', topic)}
                        />
                        <label htmlFor={`topic-${topic.name}`}>{topic.name}</label>
                      </div>
                  ))}
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="md:w-1/5">Company</Button>
                </PopoverTrigger>
                <PopoverContent>
                  {companies.map(company => (
                      <div key={company.name} className="flex items-center space-x-2">
                        <Checkbox
                            id={`company-${company.name}`}
                            checked={companyFilter.includes(company)}
                            onCheckedChange={() => handleFilterChange('company', company)}
                        />
                        <label htmlFor={`company-${company.name}`}>{company.name}</label>
                      </div>
                  ))}
                </PopoverContent>
              </Popover>
              <Button onClick={handlefilter}>Filter</Button>
            </div>
            <div className="border rounded-lg p-4 mb-4">
              <div className="flex flex-wrap gap-2">
                {topicFilter.map(topic => (
                    <div key={topic.name} className="relative inline-block">
                      <button
                          onClick={() => removeFilter('topic', topic)}
                          className="absolute -top-1 -left-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-white text-xs"
                      >
                        <X className="h-3 w-3" />
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
                    <TableHead className="font-semibold">Status</TableHead>
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
                            <TableCell>
                              <span>unsolved</span>
                            </TableCell>
                          </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-center items-center gap-4 mt-6">
              {currentPage > 1 && (
                  <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      variant="default"
                      size="default"
                  >
                    Previous
                  </Button>
              )}

              <span>
            Page {currentPage} of {totalPages}
          </span>

              {currentPage < totalPages && (
                  <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      variant="default"
                      size="default"
                  >
                    Next
                  </Button>
              )}
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

