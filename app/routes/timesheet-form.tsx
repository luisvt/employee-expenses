import { addDays, type Day, endOfWeek, format, startOfWeek } from "date-fns";
import { AutoComplete } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Fragment, useEffect, useState } from "react";
import EmployeeForm from "~/components/EmployeeForm";
import JobForm from "~/components/JobForm";
import { type Employee } from "~/models/employee";
import { type Job } from "~/models/job";
import { type ExpenseRow, type Timesheet, timesheetSchema } from "~/models/timesheet";
import db from "~/utils/db";
import type { Route } from "./+types/home";
import { NumericFormat } from "react-number-format";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tooltip } from "primereact/tooltip";
import { useNavigate, useParams } from "react-router";
import { renderToString } from "react-dom/server";
import PrintableTimesheet from "~/components/PrintableTimesheet";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

function getRows(): ExpenseRow[] {
  return new Array(5).fill({});
}

export default function Home() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employee, setEmployee] = useState<Employee>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [job, setJob] = useState<Job>();
  const [dialogHeader, setDialogHeader] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const defaultWeekStartDate = startOfWeek(new Date());

  useEffect(() => {
    if (id) {
      db.timesheets.get(Number(id)).then((timesheet) => {
        if (timesheet) {
          reset({ ...timesheet });
        }
      });
    }
  }, [id]);

  const { control, formState: { errors }, handleSubmit, reset, setValue, getValues, watch } = useForm<Timesheet>({
    defaultValues: {
      employee,
      weekRangeDates: [defaultWeekStartDate, endOfWeek(defaultWeekStartDate)],
      expenses: [{
        date: defaultWeekStartDate,
        rows: getRows(),
      }, {
        date: addDays(defaultWeekStartDate, 1),
        rows: getRows(),
      }, {
        date: addDays(defaultWeekStartDate, 2),
        rows: getRows(),
      }, {
        date: addDays(defaultWeekStartDate, 3),
        rows: getRows(),
      }, {
        date: addDays(defaultWeekStartDate, 4),
        rows: getRows(),
      }, {
        date: addDays(defaultWeekStartDate, 5),
        rows: getRows(),
      }, {
        date: addDays(defaultWeekStartDate, 6),
        rows: getRows(),
      }],
    },
    resolver: zodResolver(timesheetSchema),
  });

  const expenses = watch("expenses");

  const totalRegHours = expenses.reduce((total, { rows }) =>
    total + rows.reduce((rowTotal, row) => rowTotal + (row.regHours ?? 0), 0), 0);
  setValue("totalRegHours", totalRegHours);

  const totalOtHours = expenses.reduce((total, { rows }) =>
    total + rows.reduce((rowTotal, row) => rowTotal + (row.otHours ?? 0), 0), 0);
  setValue("totalOtHours", totalOtHours);

  const totalDriverMiles = expenses.reduce((total, { rows }) =>
    total + rows.reduce((rowTotal, row) => rowTotal + (row.driverMiles ?? 0), 0), 0);
  setValue("totalDriverMiles", totalDriverMiles);

  const totalPassengerMiles = expenses.reduce((total, { rows }) =>
    total + rows.reduce((rowTotal, row) => rowTotal + (row.passengerMiles ?? 0), 0), 0);
  setValue("totalPassengerMiles", totalPassengerMiles);

  const totalPerDiem = expenses.reduce((total, { rows }) =>
    total + rows.reduce((rowTotal, row) => rowTotal + (row.perDiem ?? 0), 0), 0);
  setValue("totalPerDiem", totalPerDiem);

  const weekStartDate = watch("weekRangeDates.0");

  useEffect(() => {
    setValue("expenses", [{
      date: weekStartDate,
      rows: expenses[0].rows,
    }, {
      date: addDays(weekStartDate, 1),
      rows: expenses[1].rows,
    }, {
      date: addDays(weekStartDate, 2),
      rows: expenses[2].rows,
    }, {
      date: addDays(weekStartDate, 3),
      rows: expenses[3].rows,
    }, {
      date: addDays(weekStartDate, 4),
      rows: expenses[4].rows,
    }, {
      date: addDays(weekStartDate, 5),
      rows: expenses[5].rows,
    }, {
      date: addDays(weekStartDate, 6),
      rows: expenses[6].rows,
    }]);
  }, [weekStartDate]);


  async function searchEmployees(event: { query: string }) {
    const results = await db.employees
      .filter((employee) =>
        employee.name.toLowerCase().includes(event.query.toLowerCase()))
      .toArray();
    setEmployees(results);
  }

  const openEmployeeForm = (action: string) => () => {
    setDialogHeader(action + " Employee");
    setDialogType("employee");
    setDialogVisible(true);
  }

  async function searchJobs(event: { query: string }) {
    const results = await db.jobs
      .filter(job => job.name.toLowerCase().includes(event.query.toLowerCase()))
      .toArray();
    setJobs(results);
  }

  const openJobForm = (action: string) => () => {
    setDialogHeader(action + " Job");
    setDialogType("job");
    setDialogVisible(true);
  }

  function hideDialog() {
    setDialogVisible(false);
  }

  async function save(data: Timesheet) {
    if (id) {
      await db.timesheets.update(Number(id), data);
    } else {
      const newId = await db.timesheets.add(data);
      navigate(`./${newId}`, { replace: true });
    }
  }

  function print() {
    const css = document.querySelector("style")?.textContent ?? "";
    const html = renderToString(<PrintableTimesheet timesheet={getValues()}/>);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`<html lang="en">
<head>
<style>${css}</style>
<title>Timesheet</title>
</head>
<body>${html}</body>
</html>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  }

  return <form className="flex flex-col h-full" onSubmit={handleSubmit(save)}>
    <Dialog header={dialogHeader} visible={dialogVisible} onHide={hideDialog} draggable={false} resizable={false}>
      {dialogType === "employee" ?
        <EmployeeForm employee={employee} onCancel={hideDialog} onSaveFinished={hideDialog}/> : null}
      {dialogType === "job" ? <JobForm job={job} hideDialog={hideDialog}/> : null}
    </Dialog>
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-3">
        {/* logo */}
      </div>
      <div className="col-span-9">
        <div className="grid grid-cols-12 gap-4 field">
          <label htmlFor="#employee" className="col-span-4">Employee Name:</label>
          <div className="col-span-8 flex flex-row gap-2">
            <Controller name="employee" control={control} defaultValue={employee} render={({ field }) => (
              <AutoComplete inputId={field.name} className="w-full" inputClassName="w-full" dropdown field="name"
                            value={field.value} onChange={e => {
                field.onChange(e.value);
                setEmployee(e.value);
              }}
                            invalid={!!errors.employee}
                            suggestions={employees} completeMethod={searchEmployees}/>
            )}/>
            <Tooltip target="#employee" content={errors.employee?.message} className="p-error" position="bottom"/>
            <Button icon="pi pi-plus" severity="secondary" tooltip="Add Employee" tooltipOptions={{ position: 'left' }}
                    onClick={openEmployeeForm("Add")}/>
            <Button icon="pi pi-pencil" severity="secondary" tooltip="Edit Employee"
                    tooltipOptions={{ position: 'left' }}
                    onClick={openEmployeeForm("Edit")}/>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4">Week Ending Date:</div>
          <div className="col-span-8">
            <Controller name="weekRangeDates" control={control}
                        render={({ field }) => (
                          <Calendar className="w-full" inputId={field.name} selectionMode="range" readOnlyInput
                                    value={[field.value[0], endOfWeek(field.value[0])]}
                                    onChange={e => {
                                      const value = e.value?.[0] ?? "";
                                      const start = startOfWeek(value);
                                      const end = endOfWeek(value);
                                      field.onChange([start, end]);
                                    }}/>
                        )}/>
            <Tooltip target="#weekRangeDates" content={errors.weekRangeDates?.message} className="p-error"
                     position="bottom"/>
          </div>
        </div>
      </div>
    </div>

    <div className="block overflow-y-auto h-full">
      <table className="w-full overflow-auto">
        <thead className="sticky top-0 bg-gray-200 z-10">
        <tr>
          <th>Day</th>
          <th>Date</th>
          <th>Job #</th>
          <th>Job Name</th>
          <th>Cost Code</th>
          <th>Reg Hrs</th>
          <th>OT Hrs</th>
          <th>Driver (.30/mi)</th>
          <th>Passenger (.20/mi)</th>
          <th>Per Diem ($25 Day/6 Day max.)</th>
        </tr>
        </thead>
        <tbody className="border-top-1">
        {expenses.map(({ date, rows }, day) => (<Fragment key={day}>
          {rows.map((row, index) => (
            <tr key={index}>
              {index === 0 ? <td className="border-1" rowSpan={rows.length}>{format(date, "EEEE")}</td> : null}
              {index === 0 ? <td className="border-1" rowSpan={rows.length}>{format(date, "dd/MM/yy")}</td> : null}
              <td className="border-1">{row.job?.number}</td>
              <td className="border-1 flex flex-row">
                <Controller name={`expenses.${day as Day}.rows.${index}.job`} control={control} defaultValue={row.job}
                            render={({ field }) => (
                              <AutoComplete inputId={field.name} className="w-full" inputClassName="w-full" dropdown
                                            field="name"
                                            value={field.value} onChange={e => {
                                console.log('e.value: ', e.value)
                                field.onChange(e.value);
                                if (typeof e.value === "object") {
                                  setValue(`expenses.${day as Day}.rows.${index}.regHours`,
                                    getValues(`expenses.${day as Day}.rows.${index}.regHours`) ?? 8);
                                  setValue(`expenses.${day as Day}.rows.${index}.perDiem`,
                                    getValues(`expenses.${day as Day}.rows.${index}.perDiem`) ?? 25);
                                } else if (e.value === "") {
                                  field.onChange(undefined);
                                }
                              }}
                                            invalid={!!errors.expenses?.[day]?.rows?.[index]?.job}
                                            suggestions={jobs} completeMethod={searchJobs}/>
                            )}/>
                <Button icon="pi pi-plus" severity="secondary" tooltip="Add Job" onClick={openJobForm("Add")}/>
                <Tooltip target={`#expenses\\.${day}\\.rows\\.${index}\\.job`}
                         content={errors.expenses?.[day]?.rows?.[index]?.job?.message}
                         className="p-error" position="bottom"/>
              </td>
              <td className="border-1">{row.job?.costCode}</td>
              <td className="border-1 w-32">
                <Controller name={`expenses.${day as Day}.rows.${index}.regHours`} control={control}
                            defaultValue={row.regHours}
                            render={({ field }) => (
                              <InputNumber inputId={field.name} inputClassName="w-full" showButtons
                                           value={field.value} onValueChange={e => field.onChange(e.value)}
                                           invalid={!!errors.expenses?.[day]?.rows?.[index]?.regHours}
                                           max={12} min={0} step={1}/>
                            )}/>
              </td>
              <td className="border-1">{row.otHours}</td>
              <td className="border-1">{row.driverMiles}</td>
              <td className="border-1">{row.passengerMiles}</td>
              <td className="border-1 w-32">
                <Controller name={`expenses.${day as Day}.rows.${index}.perDiem`} control={control} defaultValue={row.perDiem}
                            render={({ field }) => (
                              <InputNumber inputId={field.name} className="w-full" showButtons mode="currency"
                                           currency="USD"
                                           value={field.value} onValueChange={e => field.onChange(e.value)}
                                           invalid={!!errors.expenses?.[day]?.rows?.[index]?.perDiem}
                                           max={25} min={0} step={1}/>
                            )}/>
              </td>
            </tr>))}
        </Fragment>))}
        </tbody>
        <tfoot className="sticky bottom-0 bg-gray-200 z-10">
        <tr>
          <td colSpan={3} className="text-right">Weekly Total</td>
          <td className="p-4">{/* Total Job Name */}</td>
          <td className="p-4">{/* Total Cost Code */}</td>
          <td className="p-4">{totalRegHours}</td>
          <td className="p-4">{totalOtHours}</td>
          <td className="p-4">{totalDriverMiles}</td>
          <td className="p-4">{totalPassengerMiles}</td>
          <td className="p-4">
            <NumericFormat value={totalPerDiem} displayType="text" thousandSeparator prefix="$" decimalScale={2}
                           fixedDecimalScale/>
          </td>
        </tr>
        </tfoot>
      </table>
    </div>
    <div className="flex flex-row gap-4 p-4 bg-gray-300">
      <Button label="Save" icon="pi pi-check"/>
      <Button label="Cancel" icon="pi pi-times" severity="secondary" type="button" onClick={() => {
        history.back()
      }}/>
      <Button label="Print" icon="pi pi-print" severity="secondary" type="button" onClick={print}/>
    </div>
  </form>;
}
