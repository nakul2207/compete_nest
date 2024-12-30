import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

const dummyProblems = [
    { id: 1, title: 'Two Sum', difficulty: 'Easy', topic: 'Array', submissions: 1000 },
    { id: 2, title: 'Add Two Numbers', difficulty: 'Medium', topic: 'Linked List', submissions: 800 },
    { id: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'String', submissions: 1200 },
    { id: 4, title: 'Median of Two Sorted Arrays', difficulty: 'Hard', topic: 'Array', submissions: 500 },
]

const topicsMap = {
    'Array': 'Array',
    'String': 'String',
    'Linked List': 'Linked List',
    // Add other topics here...
}

type Problem = typeof dummyProblems[0]

export function ManageProblems() {
    const [problems, setProblems] = useState(dummyProblems)
    const [searchTerm, setSearchTerm] = useState('')
    const [difficultyFilter, setDifficultyFilter] = useState('All')
    const [topicFilter, setTopicFilter] = useState('All')
    const [sortBy, setSortBy] = useState<keyof Problem>('title')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    const handleDelete = (id: number) => {
        setProblems(problems.filter(problem => problem.id !== id))
    }

    const filteredAndSortedProblems = useMemo(() => {
        return problems
            .filter(problem =>
                problem.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (difficultyFilter === 'All' || problem.difficulty === difficultyFilter) &&
                (topicFilter === 'All' || problem.topic === topicFilter)
            )
            .sort((a, b) => {
                if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1
                if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1
                return 0
            })
    }, [problems, searchTerm, difficultyFilter, topicFilter, sortBy, sortOrder])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Problems</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-1">
                            <Input
                                placeholder="Search problems..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Difficulties</SelectItem>
                                <SelectItem value="Easy">Easy</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={topicFilter} onValueChange={setTopicFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Topic" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Topics</SelectItem>
                                {Object.entries(topicsMap).map(([id, name]) => (
                                    <SelectItem key={id} value={id}>{name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="flex-1"
                            >
                                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                            </Button>
                            <Button asChild className="whitespace-nowrap">
                                <Link to="/admin/problems/add">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Problem
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Difficulty</TableHead>
                                    <TableHead>Topic</TableHead>
                                    <TableHead>Submissions</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedProblems.map((problem) => (
                                    <TableRow key={problem.id}>
                                        <TableCell>{problem.title}</TableCell>
                                        <TableCell>{problem.difficulty}</TableCell>
                                        <TableCell>{problem.topic}</TableCell>
                                        <TableCell>{problem.submissions}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link to={`/admin/problems/edit/${problem.id}`}>
                                                        <Pencil className="h-4 w-4 text-yellow-500" />
                                                    </Link>
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleDelete(problem.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

