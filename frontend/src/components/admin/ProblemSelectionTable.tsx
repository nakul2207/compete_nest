import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { MultiSelect } from '@/components/ui/multi-select'
import { fetchProblems } from '@/api/problemApi'
import { useAppSelector } from "@/redux/hook.ts";
import { X } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner.tsx";

interface Problem {
    id: string
    problemId: string
    title: string
    difficulty: string
}

interface Topic {
    id: string
    name: string
}

interface Company {
    id: string
    name: string
}

interface ProblemSelectionTableProps {
    problems: Problem[]
    selectedProblems: Problem[]
    onProblemToggle: (problem: Problem) => void
}

export function ProblemSelectionTable({
    problems,
    selectedProblems,
    onProblemToggle,
}: ProblemSelectionTableProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const [difficultyFilter, setDifficultyFilter] = useState<string>('All')
    const [topicFilter, setTopicFilter] = useState<Topic[]>([])
    const [companyFilter, setCompanyFilter] = useState<Company[]>([])
    const [filteredProblems, setFilteredProblems] = useState<Problem[]>(problems)
    const [isloading, setIsLoading] = useState(true);

    const topics: Topic[] = useAppSelector((state) => state.topics);
    const companies: Company[] = useAppSelector((state) => state.companies);

    // console.log("problems render");

    useEffect(() => {
        setIsLoading(true);
        handleFilter().then((_data) => {
            // console.log(data); 
            setIsLoading(false);
        }).catch((error) =>
            console.log(error)
        );

    }, [])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleFilter = async () => {
        const topicIds = topicFilter.map(topic => topic.id)
        const companyIds = companyFilter.map(company => company.id)
        try {
            const data = await fetchProblems(searchTerm, difficultyFilter, topicIds, companyIds, currentPage)
            setFilteredProblems(data.problems)
        } catch (error) {
            console.error("Error fetching filtered problems:", error)
        }
    }

    const handleMultiSelectChange = (
        filterType: "topic" | "company",
        values: (Topic | Company)[]
    ) => {
        if (filterType === "topic") {
            setTopicFilter(values as Topic[])
        } else {
            setCompanyFilter(values as Company[])
        }
    }

    const removeFilter = useCallback((filterType: "topic" | "company", value: Topic | Company) => {
        if (filterType === "topic") {
            setTopicFilter(prev => prev.filter(item => item.id !== value.id));
        } else {
            setCompanyFilter(prev => prev.filter(item => item.id !== value.id));
        }
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <Input
                    placeholder="Search problems..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64"
                />
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Difficulties</SelectItem>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                </Select>
                <div className="w-full sm:w-40">
                    <MultiSelect
                        options={topics.map(topic => ({ id: topic.id, name: topic.name }))}
                        selected={topicFilter.map(topic => topic.id)}
                        onChange={(values) => handleMultiSelectChange('topic', topics.filter(topic => values.includes(topic.id)))}
                        placeholder="Select topics"
                        label="Topics"
                    />
                </div>
                <div className="w-full sm:w-40">
                    <MultiSelect
                        options={companies.map(company => ({ id: company.id, name: company.name }))}
                        selected={companyFilter.map(company => company.id)}
                        onChange={(values) => handleMultiSelectChange('company', companies.filter(company => values.includes(company.id)))}
                        placeholder="Select companies"
                        label="Companies"
                    />
                </div>
                <Button type="button" onClick={handleFilter}>Filter</Button>
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
                            <span
                                className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-1 rounded-full">
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
                            <span
                                className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-1 rounded-full">
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
                            <TableHead className="w-[50px]">Select</TableHead>
                            <TableHead className="font-semibold">Title</TableHead>
                            <TableHead className="font-semibold">Difficulty</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isloading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center">
                                    <Spinner />
                                </TableCell>
                            </TableRow>) :
                            (filteredProblems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                                        No problems found
                                    </TableCell>
                                </TableRow>
                            ) : filteredProblems.map((problem) => (
                                <TableRow key={problem.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedProblems.some((p) => p.id === problem.id)}
                                            onCheckedChange={() => onProblemToggle(problem)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{problem.title}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                        ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                            {problem.difficulty}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            )))}
                    </TableBody>
                </Table>
            </div>
            {
                !(filteredProblems.length === 0 && currentPage === 1) &&
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
                        <span className="font-medium text-sm text-muted-foreground">Page {currentPage}</span>
                        <Button
                            onClick={() => handlePageChange(currentPage + 1)}
                            variant="outline"
                            size="sm"
                            disabled={filteredProblems.length < 10}
                        >
                            <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                    </div>
                )
            }
        </div>
    )
}

