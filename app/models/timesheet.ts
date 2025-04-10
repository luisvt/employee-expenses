import { z } from "zod";
import { type Job, jobSchema } from "./job";
import { type Employee, employeeSchema } from "./employee";

export type ExpenseRow = {
  job?: Job;
  regHours?: number | null;
  otHours?: number | null;
  driverMiles?: number | null;
  passengerMiles?: number | null;
  perDiem?: number | null;
};

export type ExpensesByDay = {
  date: Date;
  rows: ExpenseRow[];
};

export type Expenses = [
  ExpensesByDay,
  ExpensesByDay,
  ExpensesByDay,
  ExpensesByDay,
  ExpensesByDay,
  ExpensesByDay,
  ExpensesByDay,
]

export interface Timesheet {
  id?: number;
  employee?: Employee;
  weekRangeDates: [Date, Date];
  expenses: Expenses;
  totalRegHours?: number;
  totalOtHours?: number;
  totalDriverMiles?: number;
  totalPerDiem?: number;
  totalPassengerMiles?: number;
  totalCost?: number;
}

const expenseRowSchema: z.Schema<ExpenseRow> = z.object({
  job: jobSchema.optional(),
  regHours: z.number().min(0).optional().nullable(),
  otHours: z.number().min(0).optional().nullable(),
  driverMiles: z.number().min(0).optional().nullable(),
  passengerMiles: z.number().min(0).optional().nullable(),
  perDiem: z.number().min(0).optional().nullable(),
});

const expensesByDaySchema: z.Schema<ExpensesByDay> = z.object({
  date: z.date(),
  rows: z.array(expenseRowSchema),
});

const expensesSchema: z.Schema<Expenses> = z.tuple([
  expensesByDaySchema,
  expensesByDaySchema,
  expensesByDaySchema,
  expensesByDaySchema,
  expensesByDaySchema,
  expensesByDaySchema,
  expensesByDaySchema,
]);

export const timesheetSchema: z.Schema<Timesheet> = z.object({
  id: z.number().optional(),
  employee: employeeSchema,
  weekRangeDates: z.tuple([z.date(), z.date()]),
  expenses: expensesSchema,
  totalHours: z.number().min(0),
  totalMiles: z.number().min(0),
  totalPerDiem: z.number().min(0),
  totalCost: z.number().min(0),
});
