import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { MultiSelect } from "@/components/ui/multi-select"
import { MarkdownEditor } from '../ui/mdx-editor'
import { problemSchema, ProblemFormData } from '../../schemas/problemSchema'
import {saveProblem, uploadToS3} from "@/api/problemApi.ts";
import {languages} from "@/assets/mapping.ts";
import { useAppSelector} from "@/redux/hook.ts"

interface Company {
    id: string;
    name: string;
}

interface Topic {
    id: string;
    name: string;
}

const difficulties = ['Easy', 'Medium', 'Hard']

export function AddProblem() {
    const navigate = useNavigate();
    const topics: Topic[]  = useAppSelector((state) => state.topics);
    const companies: Company[]  = useAppSelector((state) => state.companies);

    const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProblemFormData>({
        resolver: zodResolver(problemSchema),
        defaultValues: {
            title: '',
            difficulty: '',
            topics: [],
            companies: [],
            description: '',
            inputFormat: '',
            constraints: '',
            outputFormat: '',
            ownerCode: '',
            ownerCodeLanguage: '',
            testCases: [{ input: null, output: null, isExample: false }],
            resources: [{ file: null, caption: '' }]
        }
    })

    console.log("re rendered")

    const onSubmit = async (data: ProblemFormData) => {
        // console.log(data)
        const formData = {
            ...data,
            testCases: data.testCases.map((testCase: any) => testCase.isExample),
            resources: data.resources.map((resource: any) => resource.caption),
        };
        // console.log(formData);

        const results = await saveProblem(formData);
        console.log(results);

        await Promise.all(
            //uploading all testcases files
            data.testCases.map(async (testCase, index) => {
                const urls = results.testcasesURLs[index];

                // Upload input file
                if (testCase.input && urls.inputUrl) {
                    await uploadToS3(urls.inputUrl, testCase.input, testCase.input.type);
                }

                // Upload output file
                if (testCase.output && urls.outputUrl) {
                    await uploadToS3(urls.outputUrl, testCase.output, testCase.output.type);
                }
            })
        );

        await Promise.all(
            //uploading all resource files
            data.resources.map(async (resource, index) =>{
                const url = results.resourceURLs[index];

                if(resource.file && url){
                    await uploadToS3(url, resource.file, resource.file.type);
                }
            })
        );

        // navigate('/admin/problems')
    }

    const handleMultiSelect = useCallback((field: 'topics' | 'companies', value: string[]) => {
        setValue(field, value)
    }, [setValue])

    const handleTestCaseChange = useCallback((index: number, field: 'input' | 'output' | 'isExample', value: any) => {
        setValue(`testCases.${index}.${field}`, value)
    }, [setValue])

    const handleResourceChange = useCallback((index: number, field: 'file' | 'caption', value: any) => {
        setValue(`resources.${index}.${field}`, value)
    }, [setValue])

    const addTestCase = useCallback(() => {
        const currentTestCases = watch('testCases')
        setValue('testCases', [...currentTestCases, { input: null, output: null, isExample: false }])
    }, [setValue, watch])

    const removeTestCase = useCallback((index: number) => {
        const currentTestCases = watch('testCases')
        setValue('testCases', currentTestCases.filter((_, i) => i !== index))
    }, [setValue, watch])

    const addResource = useCallback(() => {
        const currentImages = watch('resources')
        setValue('resources', [...currentImages, { file: null, caption: '' }])
    }, [setValue, watch])

    const removeResource = useCallback((index: number) => {
        const currentImages = watch('resources')
        setValue('resources', currentImages.filter((_, i) => i !== index))
    }, [setValue, watch])

    const testCases = watch('testCases')
    const resources = watch('resources')

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Problem</CardTitle>
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
                                        id="title"
                                        {...field}
                                        className="max-w-md"
                                    />
                                )}
                            />
                            {errors.title && <p className="text-red-500">{errors.title.message}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="difficulty">Difficulty</Label>
                                <Controller
                                    name="difficulty"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select difficulty" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {difficulties.map(diff => (
                                                    <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.difficulty && <p className="text-red-500">{errors.difficulty.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="topics">Topics</Label>
                                <Controller
                                    name="topics"
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={topics.map(topic => ({ id: topic.id, name: topic.name }))}
                                            selected={field.value}
                                            onChange={(values) => handleMultiSelect('topics', values)}
                                            placeholder="Select topics"
                                            label="Available Topics"
                                        />
                                    )}
                                />
                                {errors.topics && <p className="text-red-500">{errors.topics.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="companies">Companies</Label>
                                <Controller
                                    name="companies"
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={companies.map(company => ({ id: company.id, name: company.name }))}
                                            selected={field.value}
                                            onChange={(values) => handleMultiSelect('companies', values)}
                                            placeholder="Select companies"
                                            label="Available Companies"
                                        />
                                    )}
                                />
                                {errors.companies && <p className="text-red-500">{errors.companies.message}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {['description', 'inputFormat', 'constraints', 'outputFormat'].map((field) => (
                            <div key={field}>
                                <Label htmlFor={field} className="capitalize mb-2 block">
                                    {field.replace(/([A-Z])/g, ' $1').trim()}
                                </Label>
                                <Controller
                                    name={field as keyof ProblemFormData}
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <MarkdownEditor
                                            value={value}
                                            onChange={onChange}
                                            placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}...`}
                                        />
                                    )}
                                />
                                {errors[field as keyof ProblemFormData] && (
                                    <p className="text-red-500">{errors[field as keyof ProblemFormData]?.message}</p>
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
                                    <Select onValueChange={field.onChange} value={field.value}>
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
                        {testCases.map((testCase, index) => (
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
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Images (Optional)</h3>
                        {resources.map((image, index) => (
                            <Card key={index}>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-medium">Image {index + 1}</h4>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeResource(index)}>
                                            <MinusCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor={`image-${index}`}>Image File</Label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id={`image-${index}`}
                                                    onChange={(e) => handleResourceChange(index, 'file', e.target.files?.[0] || null)}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full"
                                                    onClick={() => document.getElementById(`image-${index}`)?.click()}
                                                >
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    {image.file ? image.file.name : 'Upload Image'}
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor={`caption-${index}`}>Caption</Label>
                                            <Controller
                                                name={`resources.${index}.caption`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        id={`caption-${index}`}
                                                        {...field}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        <Button type="button" variant="outline" onClick={addResource}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Image
                        </Button>
                    </div>
                    <Button type="submit">Create Problem</Button>
                </form>
            </CardContent>
        </Card>
    )
}

