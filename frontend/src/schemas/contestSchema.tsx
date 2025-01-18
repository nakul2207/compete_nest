import * as z from "zod";

export const contestSchema = z
    .object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        startTime: z.date({
            required_error: "Start time is required",
        }),
        endTime: z.date({
            required_error: "End time is required",
        }),
        problems: z
            .array(
                z.object({
                    id: z.string(),
                    title: z.string(),
                    score: z.number().min(0, "Score must be non-negative"),
                })
            )
            .min(1, "At least one problem is required"),
    })
    .refine(
        (data) => {
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60);
            return data.startTime >= oneHourLater;
        },
        {
            path: ["startTime"],
            message: "Start time must be at least 1 hour from now.",
        }
    )
    .refine(
        (data) => {
            return data.endTime > data.startTime;
        },
        {
            path: ["endTime"],
            message: "End time must be later than the start time.",
        }
    );

export type ContestFormData = z.infer<typeof contestSchema>;
