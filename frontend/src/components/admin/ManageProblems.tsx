import { useState, useEffect, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Pencil, Trash2, Plus, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { MultiSelect } from "@/components/ui/multi-select"
import { useAppSelector } from "@/redux/hook"
import { deleteProblem, fetchAdminProblems, getAdminAllProblems } from "@/api/problemApi.ts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Spinner } from '../ui/Spinner.tsx'

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
    const [problems, setProblems] = useState<Problem[]>([]);

    const [searchTerm, setSearchTerm] = useState("")
    const [difficultyFilter, setDifficultyFilter] = useState("All")
    const [topicFilter, setTopicFilter] = useState<Topic[]>([])
    const [companyFilter, setCompanyFilter] = useState<Company[]>([])
    const [refresh, setRefresh] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    const topics: Topic[] = useAppSelector((state) => state.topics);
    const companies: Company[] = useAppSelector((state) => state.companies);


    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    useEffect(() => {
        setIsLoading(true);
        getAdminAllProblems(currentPage)
            .then((data) => {
                setProblems(data.problems);
                setIsLoading(false);
            }).catch((error) => {
                console.error("Error fetching problems:", error);
            });
    }, []);

    const handleFilter = useCallback(async () => {
        const topicIds = topicFilter.map((topic) => topic.id);
        const companyIds = companyFilter.map((company) => company.id);
        const data = await fetchAdminProblems(searchTerm, difficultyFilter, topicIds, companyIds, currentPage);
        setProblems(data.problems);
    }, [refresh, currentPage, companyFilter, difficultyFilter, searchTerm, topicFilter]);

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
        deleteProblem(id).then((data) => {
            console.log(data);

            setRefresh((prev) => prev + 1);
            handleFilter().then();
        }).catch((error) => {
            console.log(error);
        });
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
                <div className="flex flex-wrap gap-4 mb-6">
                    <Input
                        placeholder="Search problems..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="md:w-1/3"
                    />
                    <Select onValueChange={setDifficultyFilter} defaultValue="All">
                        <SelectTrigger className="max-w-fit md:w-1/5">
                            <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Difficulties &nbsp;</SelectItem>
                            <SelectItem value="Easy">Easy &nbsp;</SelectItem>
                            <SelectItem value="Medium">Medium &nbsp;</SelectItem>
                            <SelectItem value="Hard">Hard &nbsp;</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="md:w-1/5 grow">
                        <MultiSelect
                            options={topics.map(topic => ({ id: topic.id, name: topic.name }))}
                            selected={topicFilter.map(topic => topic.id)}
                            onChange={(values) => handleMultiSelectChange('topic', topics.filter(topic => values.includes(topic.id)))}
                            placeholder="Select topics"
                            label="Topics"
                        />
                    </div>
                    <div className="md:w-1/5 grow">
                        <MultiSelect
                            options={companies.map(company => ({ id: company.id, name: company.name }))}
                            selected={companyFilter.map(company => company.id)}
                            onChange={(values) => handleMultiSelectChange('company', companies.filter(company => values.includes(company.id)))}
                            placeholder="Select companies"
                            label="Companies"
                        />
                    </div>
                    <Button onClick={handleFilter} className="grow">Filter</Button>
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
                                {/* <TableHead className="font-semibold">Submissions</TableHead> */}
                                <TableHead className="font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center">
                                        <Spinner />
                                    </TableCell>
                                </TableRow>) :
                                (problems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                                            No problems found
                                        </TableCell>
                                    </TableRow>
                                ) : (problems.map((problem) => (
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
                                        {/* <TableCell>{problem.submissions}</TableCell> */}
                                        <TableCell>
                                            <div className="flex justify-items-start gap-2 space-x-2">
                                                <Pencil className="h-4 w-4 cursor-pointer hover:text-yellow-500" onClick={() => navigate(`/admin/problems/edit/${problem.problemId}`)} />
                                                <Trash2 className="h-4 w-4 cursor-pointer hover:text-red-500" onClick={() => handleDelete(problem.problemId)} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))))
                            }
                        </TableBody>
                    </Table>
                </div>
                {!(problems.length === 0 && currentPage === 1) &&
                    (
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <Button
                                onClick={() => handlePageChange(currentPage - 1)}
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                            >
                                <ChevronLeftIcon className="h-4 w-4" />
                            </Button>
                            <span className="font-medium text-sm text-muted-foreground"> Page {currentPage} </span>
                            <Button
                                onClick={() => handlePageChange(currentPage + 1)}
                                variant="outline"
                                size="sm"
                                disabled={problems.length < 10}
                            >
                                <ChevronRightIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    )
                }
            </CardContent>
        </Card>
    )
}