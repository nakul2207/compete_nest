import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { contestSchema, ContestFormData } from '@/schemas/contestSchema'
import { ProblemSelectionTable } from './ProblemSelectionTable.tsx'
import { X } from 'lucide-react'
import { getAllProblems } from '@/api/problemApi'
import { createContest } from "@/api/contestApi.ts";
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader } from 'lucide-react';

interface Problem {
    id: string
    problemId: string
    title: string
    difficulty: string
}

export function AddContest() {
    const [allProblems, setAllProblems] = useState<Problem[]>([])
    const [selectedProblems, setSelectedProblems] = useState<(Problem & { score: number })[]>([])
    const [submitting, setSubmitting] = useState(false);

    const { control, handleSubmit, formState: { errors }, setValue } = useForm<ContestFormData>({
        resolver: zodResolver(contestSchema),
        defaultValues: {
            title: '',
            description: '',
            startTime: new Date(),
            endTime: new Date(),
            problems: [],
        },
    })
    const navigate = useNavigate();

    useEffect(() => {
        getAllProblems(1)
            .then((data) => {
                setAllProblems(data.problems);
            }).catch((error) => {
                console.error("Error fetching problems:", error);
            });
    }, []);

    // console.log("render");

    useEffect(() => {
        setValue('problems', selectedProblems.map(p => ({ id: p.problemId, title: p.title, score: p.score })))
    }, [selectedProblems, setValue])

    const onSubmit = async (data: ContestFormData) => {
        try {
            setSubmitting(true);
            await createContest(data);
            toast.success('Contest created successfully');
            navigate('/admin/contests');
        } catch (error: any) {
            toast.error(`Failed to create contest: ${error.message}`);
        }finally{
            setSubmitting(false);
        }
    }

    const handleProblemToggle = (problem: Problem) => {
        setSelectedProblems(prev => {
            const isSelected = prev.some(p => p.problemId === problem.problemId)
            if (isSelected) {
                return prev.filter(p => p.problemId !== problem.problemId)
            } else {
                return [...prev, { ...problem, score: 0 }]
            }
        })
    }

    const handleRemoveSelectedProblem = (problemId: string) => {
        setSelectedProblems(prev => prev.filter(p => p.problemId !== problemId))
    }

    const handleScoreChange = (problemId: string, score: number) => {
        setSelectedProblems(prev =>
            prev.map(p => p.problemId === problemId ? { ...p, score } : p)
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Add New Contest</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Title</Label>
                                    <Controller
                                        name="title"
                                        control={control}
                                        render={({ field }) => (
                                            <Input id="title" {...field} className="w-full" />
                                        )}
                                    />
                                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Controller
                                        name="description"
                                        control={control}
                                        render={({ field }) => (
                                            <Textarea id="description" {...field} rows={4} className="w-full" />
                                        )}
                                    />
                                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Controller
                                    name="startTime"
                                    control={control}
                                    render={({ field: { onChange, ...field } }) => (
                                        <DateTimePicker
                                            id="startTime"
                                            label="Start Time"
                                            {...field}
                                            value={field.value.toISOString()}
                                            onChange={(e) => {
                                                const date = new Date(e.target.value);
                                                onChange(date);
                                            }}
                                        />
                                    )}
                                />
                                {errors.startTime && (
                                    <p className="text-red-500 text-sm">{errors.startTime.message}</p>
                                )}

                                <Controller
                                    name="endTime"
                                    control={control}
                                    render={({ field: { onChange, ...field } }) => (
                                        <DateTimePicker
                                            id="endTime"
                                            label="End Time"
                                            {...field}
                                            value={field.value.toISOString()}
                                            onChange={(e) => {
                                                const date = new Date(e.target.value);
                                                onChange(date);
                                            }}
                                        />
                                    )}
                                />
                                {errors.endTime && (
                                    <p className="text-red-500 text-sm">{errors.endTime.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">Selected Problems</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {selectedProblems.map((problem) => (
                                    <div key={problem.problemId} className="flex items-center space-x-2">
                                        <span
                                            className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-1 rounded-full">
                                            {problem.title}
                                        </span>
                                        <Input
                                            type="number"
                                            value={problem.score}
                                            onChange={(e) => handleScoreChange(problem.problemId, parseInt(e.target.value, 10))}
                                            className="w-14 h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            min="0"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSelectedProblem(problem.problemId)}
                                            className="bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {errors.problems && (
                                <p className="text-red-500 text-sm">{errors.problems.message}</p>
                            )}
                        </div>

                        <ProblemSelectionTable
                            problems={allProblems}
                            selectedProblems={selectedProblems}
                            onProblemToggle={handleProblemToggle}
                        />

                        <Button type="submit" disabled={submitting}>
                        {submitting ? <Loader className="animate-spin h-4 w-4" /> : "Create Contest"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

