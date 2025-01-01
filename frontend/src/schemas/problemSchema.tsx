import * as z from "zod"

export const problemSchema = z.object({
    title: z.string().min(1, "Title is required"),
    difficulty: z.string().min(1, "Difficulty is required"),
    topics: z.array(z.string()).min(1, "At least one topic is required"),
    companies: z.array(z.string()),
    description: z.string().min(1, "Description is required"),
    inputFormat: z.string().min(1, "Input format is required"),
    constraints: z.string().min(1, "Constraints are required"),
    outputFormat: z.string().min(1, "Output format is required"),
    ownerCode: z.string().min(1, "Owner code is required"),
    ownerCodeLanguage: z.string().min(1, "Owner code language is required"),
    testCases: z.array(z.object({
        input: z.instanceof(File).nullable(),
        output: z.instanceof(File).nullable(),
        isExample: z.boolean()
    })).min(1, "At least one test case is required"),
    resources: z.array(z.object({
        file: z.instanceof(File).nullable(),
        caption: z.string()
    }))
})

export type ProblemFormData = z.infer<typeof problemSchema>

// topics: z.array(z.object({
//     id: z.string(),
//     name: z.string()
// })).min(1, "At least one topic is required"),
//     companies: z.array(z.object({
//     id: z.string(),
//     name: z.string()
// })),
