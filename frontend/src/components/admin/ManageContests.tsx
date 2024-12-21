import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

const dummyContests = [
    { id: 1, title: 'Weekly Contest 1', startDate: '2024-01-01T20:00:00Z', duration: '2 hours', participants: 1000 },
    { id: 2, title: 'Biweekly Contest 1', startDate: '2024-01-15T14:00:00Z', duration: '3 hours', participants: 1500 },
    { id: 3, title: 'Monthly Contest 1', startDate: '2024-02-01T18:00:00Z', duration: '4 hours', participants: 2000 },
    { id: 4, title: 'Weekly Contest 2', startDate: '2023-12-25T20:00:00Z', duration: '2 hours', participants: 950 },
]

type Contest = typeof dummyContests[0]

export function ManageContests() {
    const [contests, setContests] = useState(dummyContests)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [sortBy, setSortBy] = useState<keyof Contest>('startDate')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    const handleDelete = (id: number) => {
        setContests(contests.filter(contest => contest.id !== id))
    }

    const filteredAndSortedContests = useMemo(() => {
        const now = new Date()
        return contests
            .filter(contest =>
                contest.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (statusFilter === 'all' ||
                    (statusFilter === 'upcoming' && new Date(contest.startDate) > now) ||
                    (statusFilter === 'past' && new Date(contest.startDate) <= now))
            )
            .sort((a, b) => {
                if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1
                if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1
                return 0
            })
    }, [contests, searchTerm, statusFilter, sortBy, sortOrder])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Contests</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
                    <Input
                        placeholder="Search contests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="sm:w-[300px]"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Contests</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="past">Past</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as keyof Contest)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="startDate">Start Date</SelectItem>
                            <SelectItem value="title">Title</SelectItem>
                            <SelectItem value="participants">Participants</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                        </Button>
                        <Button asChild className="sm:ml-auto">
                            <Link to="/admin/contests/add">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Contest
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Participants</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedContests.map((contest) => (
                                <TableRow key={contest.id}>
                                    <TableCell>{contest.title}</TableCell>
                                    <TableCell>{new Date(contest.startDate).toLocaleString()}</TableCell>
                                    <TableCell>{contest.duration}</TableCell>
                                    <TableCell>{contest.participants}</TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link to={`/admin/contests/edit/${contest.id}`}>
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleDelete(contest.id)}>
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

