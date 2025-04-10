import { z } from "zod";

export interface Employee {
  id?: number;
  name: string;
}

export const employeeSchema: z.Schema<Employee> = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: "Name is required" }),
});
