import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Pencil, Trash2, Plus, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Label } from '../ui/label'
import { ScrollArea } from '../ui/scroll-area'

const initialCompanies = [
    { id: 1, name: 'Google' },
    { id: 2, name: 'Amazon' },
    { id: 3, name: 'Microsoft' },
    { id: 4, name: 'Apple' },
    { id: 5, name: 'Facebook' },
]

export function ManageCompanies() {
    const [companies, setCompanies] = useState(initialCompanies)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [newCompanies, setNewCompanies] = useState([''])
    const [editingCompany, setEditingCompany] = useState<{ id: number, name: string } | null>(null)

    const handleAddCompany = () => {
        setNewCompanies([...newCompanies, ''])
    }

    const handleRemoveCompany = (index: number) => {
        setNewCompanies(newCompanies.filter((_, i) => i !== index))
    }

    const handleNewCompanyChange = (index: number, value: string) => {
        const updatedCompanies = [...newCompanies]
        updatedCompanies[index] = value
        setNewCompanies(updatedCompanies)
    }

    const handleAdd = () => {
        const validCompanies = newCompanies.filter(name => name.trim() !== '')
        if (validCompanies.length > 0) {
            const newCompanyObjects = validCompanies.map((name, index) => ({
                id: companies.length + index + 1,
                name: name.trim()
            }))
            setCompanies([...companies, ...newCompanyObjects])
            setNewCompanies([''])
            setIsAddModalOpen(false)
        }
    }

    const handleEdit = () => {
        if (editingCompany && editingCompany.name.trim()) {
            setCompanies(companies.map(company =>
                company.id === editingCompany.id ? { ...company, name: editingCompany.name.trim() } : company
            ))
            setIsEditModalOpen(false);
        }
    }

    const handleDelete = (id: number) => {
        setCompanies(companies.filter(company => company.id !== id));
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Manage Companies</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Button onClick={() => setIsAddModalOpen(true)} className="w-fit sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Companies
                    </Button>
                </div>
                <div className="rounded-md border w-fit">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="font-semibold">Name</TableHead>
                                <TableHead className="font-semibold w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {companies.map((company) => (
                                <TableRow key={company.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium">{company.name}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => { setEditingCompany(company); setIsEditModalOpen(true); }}>
                                                <Pencil className="h-4 w-4 text-yellow-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(company.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Companies</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh] pr-4">
                            {newCompanies.map((company, index) => (
                                <div key={index} className="flex items-center space-x-2 mb-2">
                                    <Input
                                        value={company}
                                        onChange={(e) => handleNewCompanyChange(index, e.target.value)}
                                        placeholder="Company name"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveCompany(index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </ScrollArea>
                        <Button onClick={handleAddCompany} variant="outline" className="mt-2">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Another Company
                        </Button>
                        <DialogFooter className="mt-4 sm:mt-6">
                            <Button onClick={handleAdd} className="w-full">Add Companies</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Company</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="edit-name"
                                    value={editingCompany?.name || ''}
                                    onChange={(e) => setEditingCompany(prev => prev ? { ...prev, name: e.target.value } : null)}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleEdit} className="w-full">Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}

