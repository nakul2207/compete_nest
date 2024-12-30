import {useEffect, useState} from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Pencil, Trash2, Plus, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../ui/dialog'
import { Label } from '../ui/label'
import { ScrollArea } from '../ui/scroll-area'
import {useAppDispatch, useAppSelector} from "@/redux/hook.ts";
import {createTopics, deleteTopic, getAllTopics, updateTopic} from "@/api/topicApi.ts";
import {editTopic, setTopics, removeTopic} from "@/redux/slice/topicSlice.tsx";

interface Topic {
    id: string;
    name: string;
}

export function ManageTopics() {
    const topics: Topic[]  = useAppSelector((state) => state.topics);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [newTopics, setNewTopics] = useState([''])
    const [editingTopic, setEditingTopic] = useState<{ id: string, name: string } | null>(null)
    const dispatch = useAppDispatch();

    useEffect(() => {
        getAllTopics().then((topics) => {
            // console.log(topics);
            dispatch(setTopics(topics));
        }).catch((error)=>{
            console.log(error);
        })
    }, []);

    const handleAddTopic = () => {
        setNewTopics([...newTopics, ''])
    }

    const handleRemoveTopic = (index: number) => {
        setNewTopics(newTopics.filter((_, i) => i !== index))
    }

    const handleNewTopicChange = (index: number, value: string) => {
        const updatedTopics = [...newTopics]
        updatedTopics[index] = value
        setNewTopics(updatedTopics)
    }

    const handleAdd = async () => {
        const validTopics = newTopics.filter(name => name.trim() !== '')
        if (validTopics.length > 0) {
            const newTopicObjects = validTopics.map((name) => ({
                name: name.trim()
            }))
            //updating the database
            await createTopics(newTopicObjects);

            //updating the redux state after creating topics
            getAllTopics().then((topics) => {
                // console.log(topics);
                dispatch(setTopics(topics));
            }).catch((error)=>{
                console.log(error);
            })

            setNewTopics([''])
            setIsAddModalOpen(false)
        }
    }

    const handleEdit = async () => {
        if (editingTopic && editingTopic.name.trim()) {
            await updateTopic(editingTopic.id, editingTopic.name);
            dispatch(editTopic(editingTopic));
            setIsEditModalOpen(false)
        }
    }

    const handleDelete = async (id: string) => {
        await deleteTopic(id);
        dispatch(removeTopic(id));
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Manage Topics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Topics
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
                            {topics.map((topic) => (
                                <TableRow key={topic.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium pl-2">{topic.name}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => { setEditingTopic(topic); setIsEditModalOpen(true); }}>
                                                <Pencil className="h-4 w-4 text-yellow-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(topic.id)}>
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
                            <DialogTitle>Add New Topics</DialogTitle>
                            <DialogDescription>
                                Dialog for adding topics
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh] pr-4">
                            {newTopics.map((topic, index) => (
                                <div key={index} className="flex items-center space-x-2 mb-2">
                                    <Input
                                        value={topic}
                                        onChange={(e) => handleNewTopicChange(index, e.target.value)}
                                        placeholder="Topic name"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveTopic(index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </ScrollArea>
                        <Button onClick={handleAddTopic} variant="outline" className="mt-2">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Another Topic
                        </Button>
                        <DialogFooter className="mt-4 sm:mt-6">
                            <Button onClick={handleAdd} className="w-full">Add Topics</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Topic</DialogTitle>
                            <DialogDescription>
                                Dialog for editing a topic name
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="edit-name"
                                    value={editingTopic?.name || ''}
                                    onChange={(e) => setEditingTopic(prev => prev ? { ...prev, name: e.target.value } : null)}
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

