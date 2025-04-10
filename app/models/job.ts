import { z } from "zod";

export interface Job {
    id?: number;
    name: string;
    number: string;
    costCode: string;
}

export const jobSchema: z.Schema<Job> = z.object({
    id: z.number().optional(),
    name: z.string().min(1, { message: "Name is required" }),
    number: z.string().min(1, { message: "Number is required" }),
    costCode: z.string().min(1, { message: "Cost code is required" }),
});
