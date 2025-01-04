import * as z from "zod"

export const EditProblemSchema = z.object({
    title: z.string(),
    difficulty: z.string(),
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
    }))
})

export type EditProblemFormData = z.infer<typeof EditProblemSchema>

