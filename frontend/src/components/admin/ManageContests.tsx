import { useState, useMemo, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Trash2, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { getAllContests } from '@/api/contestApi'
import { Spinner } from '../ui/Spinner.tsx'
import { deleteContest } from '@/api/contestApi'
import { toast } from "sonner"

interface Contest {
    id: string
    title: string
    startTime: string
    endTime: string
}

export function ManageContests() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [sortBy, setSortBy] = useState<keyof Contest>('startTime')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [isloading, setIsLoading] = useState(true)

    const handleDelete = (id: string) => {
        deleteContest(id).then((data) => {
            toast.success(data.message);
            setContests(contests.filter(contest => contest.id !== id))
        }).catch((err) => {
            toast.error(`Error in deleting the contest: ${err.message}`);
        })
    }

    const filteredAndSortedContests = useMemo(() => {
        const now = new Date()
        return contests.filter(contest =>
            contest.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (statusFilter === 'all' ||
                (statusFilter === 'upcoming' && new Date(contest.startTime) > now) ||
                (statusFilter === 'past' && new Date(contest.endTime) <= now) ||
                (statusFilter === 'ongoing' && new Date(contest.startTime) <= now && new Date(contest.endTime) > now))
        )
            .sort((a, b) => {
                // Handle comparison differently based on the field (date vs. string)
                let aValue, bValue;
                if (sortBy === 'startTime' || sortBy === 'endTime') {
                    // Convert dates to timestamps for numerical comparison
                    aValue = new Date(a[sortBy]).getTime();
                    bValue = new Date(b[sortBy]).getTime();
                } else if (sortBy === 'title') {
                    // Case-insensitive comparison for titles
                    aValue = a[sortBy].toLowerCase();
                    bValue = b[sortBy].toLowerCase();
                } else {
                    aValue = a[sortBy];
                    bValue = b[sortBy];
                }

                // Determine the sort order
                if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            })
    }, [contests, searchTerm, statusFilter, sortBy, sortOrder])
    useEffect(() => {
        setIsLoading(true);
        getAllContests().then((data) => {
            setContests(data.contests);
            setIsLoading(false);
        }).catch((err) => {
            console.log(err);
        })
    }, [])

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Manage Contests</CardTitle>
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
                            <SelectItem value="ongoing">Ongoing</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="past">Past</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as keyof Contest)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="startTime">Start Date</SelectItem>
                            <SelectItem value="title">Title</SelectItem>
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
                                {/* <TableHead>Participants</TableHead> */}
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isloading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center">
                                        <Spinner />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAndSortedContests.map((contest) => (
                                    <TableRow key={contest.id}>
                                        <TableCell>{contest.title}</TableCell>
                                        <TableCell>{new Date(contest.startTime).toLocaleString()}</TableCell>
                                        <TableCell>
                                            {(() => {
                                                const durationMs = new Date(contest.endTime).getTime() - new Date(contest.startTime).getTime();
                                                const durationSeconds = Math.floor(durationMs / 1000);
                                                const hours = Math.floor(durationSeconds / 3600);
                                                const minutes = Math.floor((durationSeconds % 3600) / 60);
                                                const seconds = durationSeconds % 60;

                                                return `${hours}h ${minutes}m ${seconds}s`;
                                            })()}
                                        </TableCell>
                                        {/* <TableCell>{contest.participants}</TableCell> */}
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                {/* <Button variant="outline" size="sm" asChild>
                                                    <Link to={`/admin/contests/edit/${contest.id}`}>
                                                        <Pencil className="h-4 w-4 text-yellow-500" />
                                                    </Link>
                                                </Button> */}
                                                <Button className='hover:text-red-500' variant="outline" size="icon" onClick={() => handleDelete(contest.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

