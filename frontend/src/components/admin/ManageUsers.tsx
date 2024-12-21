import  { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

const dummyUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', problemsSolved: 50 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', problemsSolved: 120 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', problemsSolved: 30 },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'user', problemsSolved: 80 },
]

type User = typeof dummyUsers[0]

export function ManageUsers() {
    const [users, setUsers] = useState(dummyUsers)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('All')
    const [sortBy, setSortBy] = useState<keyof User>('name')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    const handleRoleChange = (userId: number, newRole: string) => {
        setUsers(users.map(user =>
            user.id === userId ? { ...user, role: newRole } : user
        ))
    }

    const filteredAndSortedUsers = useMemo(() => {
        return users
            .filter(user =>
                (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (roleFilter === 'All' || user.role === roleFilter)
            )
            .sort((a, b) => {
                if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1
                if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1
                return 0
            })
    }, [users, searchTerm, roleFilter, sortBy, sortOrder])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Users</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="sm:w-[300px]"
                    />
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Roles</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as keyof User)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="problemsSolved">Problems Solved</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                        {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    </Button>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Problems Solved</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>{user.problemsSolved}</TableCell>
                                    <TableCell>
                                        <Select defaultValue={user.role} onValueChange={(value) => handleRoleChange(user.id, value)}>
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue placeholder="Change role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">User</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
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

