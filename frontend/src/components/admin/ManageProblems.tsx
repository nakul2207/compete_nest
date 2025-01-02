import { useState, useEffect, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Pencil, Trash2, Plus, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { MultiSelect } from "@/components/ui/multi-select"
import { useAppSelector } from "@/redux/hook"
import { fetchProblems, getAllProblems } from "@/api/problemApi.ts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    problemId: string;
    title: string;
    difficulty: string;
    topics: Topic[];
    companies: Company[];
    submissions: number;
}

export function ManageProblems() {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [problems, setProblems] = useState<Problem[]>([]);

    const [searchTerm, setSearchTerm] = useState("")
    const [difficultyFilter, setDifficultyFilter] = useState("All")
    const [topicFilter, setTopicFilter] = useState<Topic[]>([])
    const [companyFilter, setCompanyFilter] = useState<Company[]>([])

    const topics: Topic[] = useAppSelector((state) => state.topics);
    const companies: Company[] = useAppSelector((state) => state.companies);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const fetchAllProblems = useCallback(async () => {
        try {
            const allProblems = await getAllProblems(currentPage);
            setProblems(allProblems.problems);
            setTotalPages(allProblems.totalPages);
        } catch (error) {
            console.error("Error fetching problems:", error);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchAllProblems().then();
    }, [fetchAllProblems, currentPage]);

    const handleFilter = useCallback(async () => {
        const topicIds = topicFilter.map((topic) => topic.id);
        const companyIds = companyFilter.map((company) => company.id);
        const data = await fetchProblems(searchTerm, difficultyFilter, topicIds, companyIds, currentPage);
        setProblems(data.problems);
        setTotalPages(data.totalPages);
    }, [currentPage, companyFilter, difficultyFilter, searchTerm, topicFilter]);

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

    const handleDelete = useCallback((id: string) => {
        setProblems(problems.filter(problem => problem.id !== id))
    }, [problems]);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl font-bold flex flex-wrap justify-between items-center gap-4">
                    Manage Problems
                    <Button asChild>
                        <Link to="/admin/problems/add">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Problem
                        </Link>
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <Input
                        placeholder="Search problems..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="md:w-1/3"
                    />
                    <Select onValueChange={setDifficultyFilter} defaultValue="All">
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
                    <div className="md:w-1/5">
                        <MultiSelect
                            options={topics.map(topic => ({ id: topic.id, name: topic.name }))}
                            selected={topicFilter.map(topic => topic.id)}
                            onChange={(values) => handleMultiSelectChange('topic', topics.filter(topic => values.includes(topic.id)))}
                            placeholder="Select topics"
                            label="Topics"
                        />
                    </div>
                    <div className="md:w-1/5">
                        <MultiSelect
                            options={companies.map(company => ({ id: company.id, name: company.name }))}
                            selected={companyFilter.map(company => company.id)}
                            onChange={(values) => handleMultiSelectChange('company', companies.filter(company => values.includes(company.id)))}
                            placeholder="Select companies"
                            label="Companies"
                        />
                    </div>
                    <Button onClick={handleFilter} className="w-full md:w-1/5">Filter</Button>
                </div>

                <div className="border rounded-lg p-4 mb-4">
                    <div className="flex flex-wrap gap-2">
                        {topicFilter.map(topic => (
                            <div key={topic.id} className="relative inline-block">
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
                            <div key={company.id} className="relative inline-block">
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

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="font-semibold">Title</TableHead>
                                <TableHead className="font-semibold">Difficulty</TableHead>
                                <TableHead className="font-semibold text-right">Submissions</TableHead>
                                <TableHead className="font-semibold w-[100px] text-right">Actions</TableHead>
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
                                    <TableCell className="text-right">{problem.submissions}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Pencil className="h-4 w-4 cursor-pointer" onClick={() => navigate(`/admin/problems/edit/${problem.problemId}`)} />
                                            <Trash2 className="h-4 w-4 cursor-pointer" onClick={() => handleDelete(problem.problemId)} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
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
            </CardContent>
        </Card>
    )
}

