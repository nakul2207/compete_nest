import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { PlusCircle, MinusCircle, Upload } from 'lucide-react'
import MDEditor from '@uiw/react-md-editor'
import { MultiSelect } from "@/components/ui/multi-select"

type FormData = {
    title: string
    difficulty: string
    topics: string[]
    companies: string[]
    description: string
    inputFormat: string
    constraints: string
    outputFormat: string
    ownerCode: string
    ownerCodeLanguage: string
    testCases: {
        input: File | null
        output: File | null
        isExample: boolean
    }[]
    images: {
        file: File | null
        caption: string
    }[]
}

const difficulties = ['Easy', 'Medium', 'Hard']
const languages = ['JavaScript', 'Python', 'Java', 'C++']
const topicsMap = {
    '1': 'Array',
    '2': 'String',
    '3': 'Linked List',
    '4': 'Tree',
    '5': 'Dynamic Programming'
}
const companiesMap = {
    '1': 'Google',
    '2': 'Amazon',
    '3': 'Facebook',
    '4': 'Microsoft',
    '5': 'Apple'
}

export function AddProblem() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState<FormData>({
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
        images: [{ file: null, caption: '' }]
    })

    const handleChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleMultiSelect = useCallback((field: 'topics' | 'companies', value: string) => {
        setFormData(prev => {
            const currentValues = prev[field]
            const updatedValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value]
            return { ...prev, [field]: updatedValues }
        })
    }, [])

    const handleTestCaseChange = (index: number, field: 'input' | 'output' | 'isExample', value: any) => {
        setFormData(prev => {
            const updatedTestCases = [...prev.testCases]
            updatedTestCases[index] = { ...updatedTestCases[index], [field]: value }
            return { ...prev, testCases: updatedTestCases }
        })
    }

    const handleImageChange = (index: number, field: 'file' | 'caption', value: any) => {
        setFormData(prev => {
            const updatedImages = [...prev.images]
            updatedImages[index] = { ...updatedImages[index], [field]: value }
            return { ...prev, images: updatedImages }
        })
    }

    const addTestCase = () => {
        setFormData(prev => ({
            ...prev,
            testCases: [...prev.testCases, { input: null, output: null, isExample: false }]
        }))
    }

    const removeTestCase = (index: number) => {
        setFormData(prev => ({
            ...prev,
            testCases: prev.testCases.filter((_, i) => i !== index)
        }))
    }

    const addImage = () => {
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, { file: null, caption: '' }]
        }))
    }

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log(formData)
        // Here you would typically send the data to your backend
        navigate('/admin/problems')
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Problem</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                className="max-w-md"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="difficulty">Difficulty</Label>
                                <Select onValueChange={(value) => handleChange('difficulty', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {difficulties.map(diff => (
                                            <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="topics">Topics</Label>
                                <MultiSelect
                                    options={Object.entries(topicsMap).map(([id, name]) => ({ id, name }))}
                                    selected={formData.topics}
                                    onChange={(values) => handleChange('topics', values)}
                                    placeholder="Select topics"
                                    label="Available Topics"
                                />
                            </div>
                            <div>
                                <Label htmlFor="companies">Companies</Label>
                                <MultiSelect
                                    options={Object.entries(companiesMap).map(([id, name]) => ({ id, name }))}
                                    selected={formData.companies}
                                    onChange={(values) => handleChange('companies', values)}
                                    placeholder="Select companies"
                                    label="Available Companies"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {['description', 'inputFormat', 'constraints', 'outputFormat'].map((field) => (
                            <div key={field}>
                                <Label htmlFor={field} className="capitalize mb-2 block">{field.replace(/([A-Z])/g, ' $1').trim()}</Label>
                                <MDEditor
                                    value={formData[field as keyof FormData] as string}
                                    onChange={(value) => handleChange(field as keyof FormData, value || '')}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="ownerCode">Owner Code</Label>
                            <Textarea
                                id="ownerCode"
                                value={formData.ownerCode}
                                onChange={(e) => handleChange('ownerCode', e.target.value)}
                                rows={10}
                            />
                        </div>
                        <div>
                            <Label htmlFor="ownerCodeLanguage">Owner Code Language</Label>
                            <Select onValueChange={(value) => handleChange('ownerCodeLanguage', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {languages.map(lang => (
                                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Test Cases</h3>
                        {formData.testCases.map((testCase, index) => (
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
                                            <Switch
                                                id={`example-${index}`}
                                                checked={testCase.isExample}
                                                onCheckedChange={(checked) => handleTestCaseChange(index, 'isExample', checked)}
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
                        {formData.images.map((image, index) => (
                            <Card key={index}>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-medium">Image {index + 1}</h4>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(index)}>
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
                                                    onChange={(e) => handleImageChange(index, 'file', e.target.files?.[0] || null)}
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
                                            <Input
                                                id={`caption-${index}`}
                                                value={image.caption}
                                                onChange={(e) => handleImageChange(index, 'caption', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        <Button type="button" variant="outline" onClick={addImage}>
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

