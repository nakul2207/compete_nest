import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { PlusCircle, MinusCircle, Upload } from 'lucide-react'
import { MarkdownEditor } from '../ui/mdx-editor'
import { EditProblemSchema, EditProblemFormData } from '../../schemas/EditProblemSchema.tsx'
import { getProblemById, editProblem, uploadToS3 } from "@/api/problemApi.ts"
import { languages } from "@/assets/mapping.ts"

export function EditProblem() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [isLoading, setIsLoading] = useState(true);

    const { control, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<EditProblemFormData>({
        resolver: zodResolver(EditProblemSchema),
        defaultValues: {
            title: '',
            difficulty: '',
            description: '',
            inputFormat: '',
            constraints: '',
            outputFormat: '',
            ownerCode: '',
            ownerCodeLanguage: '',
            testCases: [{ input: null, output: null, isExample: false }]
        }
    });

    useEffect(() => {
        const fetchProblem = async () => {
            if (id) {
                try {
                    setIsLoading(true);
                    const problem = await getProblemById(id);
                    reset({
                        ...problem,
                        title: problem.title || '',
                        difficulty: problem.difficulty || '',
                        description: problem.description || '',
                        inputFormat: problem.inputFormat || '',
                        constraints: problem.constraints || '',
                        outputFormat: problem.outputFormat || '',
                        ownerCode: problem.ownerCode || '',
                        ownerCodeLanguage: problem.ownerCodeLanguage ? problem.ownerCodeLanguage.toString() : '',
                        testCases: [{ input: null, output: null, isExample: false }]
                    });
                } catch (error) {
                    console.error("Error fetching problem:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchProblem().then();
    }, [id, reset]);

    const onSubmit = async (data: EditProblemFormData) => {
        try {
            setIsLoading(true);
            const formData = {
                problemId: id,
                ...data,
                testCases: data.testCases
                    .filter((testCase: any) => testCase.input !== null && testCase.output !== null)
                    .map((testCase: any) => testCase.isExample),
            };

            const results = await editProblem(formData);

            if(results.testcasesURLs.length>0){
                await Promise.all(
                    data.testCases.map(async (testCase, index) => {
                        const urls = results.testcasesURLs[index];
                        if (testCase.input && urls.inputUrl) {
                            await uploadToS3(urls.inputUrl, testCase.input, testCase.input.type);
                        }
                        if (testCase.output && urls.outputUrl) {
                            await uploadToS3(urls.outputUrl, testCase.output, testCase.output.type);
                        }
                    })
                );
            }

            navigate('/dashboard/problems'); 
        } catch (error) {
            console.error("Error saving problem:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestCaseChange = useCallback((index: number, field: 'input' | 'output' | 'isExample', value: any) => {
        setValue(`testCases.${index}.${field}`, value, { shouldValidate: true });
    }, [setValue]);

    const addTestCase = useCallback(() => {
        setValue('testCases', [...watch('testCases'), { input: null, output: null, isExample: false }], { shouldValidate: true });
    }, [setValue, watch]);

    const removeTestCase = useCallback((index: number) => {
        setValue('testCases', watch('testCases').filter((_, i) => i !== index), { shouldValidate: true });
    }, [setValue, watch]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Problem</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title</Label>
                            <Controller
                                name="title"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="title"
                                        readOnly
                                        className="max-w-md "
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <Controller
                                name="difficulty"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="difficulty"
                                        readOnly
                                        className="max-w-md "
                                    />
                                )}
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {['description', 'inputFormat', 'constraints', 'outputFormat'].map((field) => (
                            <div key={field}>
                                <Label htmlFor={field} className="capitalize mb-2 block">
                                    {field.replace(/([A-Z])/g, ' $1').trim()}
                                </Label>
                                <Controller
                                    name={field as keyof EditProblemFormData}
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <MarkdownEditor
                                            value={value as string}
                                            onChange={(newValue) => onChange(newValue || '')}
                                            placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}...`}
                                        />
                                    )}
                                />
                                {errors[field as keyof EditProblemFormData] && (
                                    <p className="text-red-500">{errors[field as keyof EditProblemFormData]?.message}</p>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="ownerCode">Owner Code</Label>
                            <Controller
                                name="ownerCode"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        id="ownerCode"
                                        {...field}
                                        rows={10}
                                    />
                                )}
                            />
                            {errors.ownerCode && <p className="text-red-500">{errors.ownerCode.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="ownerCodeLanguage">Owner Code Language</Label>
                            <Controller
                                name="ownerCodeLanguage"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ''}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select language"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                Object.entries(languages).map(([id, language]) => (
                                                    <SelectItem key={id} value={id}>{language.name}</SelectItem>)
                                                )
                                            }
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.ownerCodeLanguage && <p className="text-red-500">{errors.ownerCodeLanguage.message}</p>}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Test Cases</h3>
                        {watch('testCases').map((testCase, index) => (
                            <Card key={index}>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-medium">Test Case {index + 1}</h4>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeTestCase(index)}>
                                            <MinusCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {['input', 'output'].map((type) => (
                                            <div key={type}>
                                                <Label htmlFor={`${type}-${index}`} className="capitalize">{type} File</Label>
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        id={`${type}-${index}`}
                                                        onChange={(e) => handleTestCaseChange(index, type as 'input' | 'output', e.target.files?.[0] || null)}
                                                        className="hidden"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="w-full"
                                                        onClick={() => document.getElementById(`${type}-${index}`)?.click()}
                                                    >
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        {testCase[type as keyof typeof testCase] ? (testCase[type as keyof typeof testCase] as File).name : `Upload ${type}`}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex items-center space-x-2">
                                            <Controller
                                                name={`testCases.${index}.isExample`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Switch
                                                        id={`example-${index}`}
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                )}
                                            />
                                            <Label htmlFor={`example-${index}`}>Use as example test case</Label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        <Button type="button" variant="outline" onClick={addTestCase}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Test Case
                        </Button>
                    </div>
                    <div className="flex justify-center mt-8">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Problem'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

