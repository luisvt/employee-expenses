import { format } from "date-fns";
import { Fragment } from "react";
import { NumericFormat } from "react-number-format";
import type { Timesheet } from "~/models/timesheet";

export default function PrintableTimesheet({ timesheet }: { timesheet: Timesheet }) {

  return <div>
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-3">
        {/* logo */}
      </div>
      <div className="col-span-9">
        <div className="grid grid-cols-12 gap-4 field">
          <label htmlFor="#employee" className="col-span-4">Employee Name:</label>
          <div className="col-span-8 flex flex-row gap-2">
            {timesheet.employee?.name}
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4">Week Ending Date:</div>
          <div className="col-span-8">
            {format(timesheet.weekRangeDates[0], "MM/dd/yyyy")} - {format(timesheet.weekRangeDates[1], "MM/dd/yyyy")}
          </div>
        </div>
      </div>
    </div>

    <table>
      <thead>
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
      <tbody>
      {timesheet.expenses.map(({ date, rows }, day) => (<Fragment key={day}>
        {rows.map((row, index) => (
          <tr key={index} className="h-5">
            {index === 0 ? <td className="border-1 px-2" rowSpan={rows.length}>{format(date, "EEEE")}</td> : null}
            {index === 0 ? <td className="border-1 px-2" rowSpan={rows.length}>{format(date, "dd/MM/yy")}</td> : null}
            <td className="border-1 w-16 px-2">{row.job?.number}</td>
            <td className="border-1 px-2">{row.job?.name}</td>
            <td className="border-1 w-16 px-2">{row.job?.costCode}</td>
            <td className="border-1 w-16 px-2">{row.regHours}</td>
            <td className="border-1 w-16 px-2">{row.otHours}</td>
            <td className="border-1 w-16 px-2">{row.driverMiles}</td>
            <td className="border-1 w-16 px-2">{row.passengerMiles}</td>
            <td className="border-1 w-20 px-2">
              <NumericFormat value={row.perDiem} displayType="text" thousandSeparator prefix="$" decimalScale={2}
                             fixedDecimalScale/>
            </td>
          </tr>))}
      </Fragment>))}
      <tr>
        <td colSpan={3} className="text-right">Weekly Total</td>
        <td>{/* Total Job Name */}</td>
        <td>{/* Total Cost Code */}</td>
        <td className="border-1 px-2">{timesheet.totalRegHours}</td>
        <td className="border-1 px-2">{timesheet.totalOtHours}</td>
        <td className="border-1 px-2">{timesheet.totalDriverMiles}</td>
        <td className="border-1 px-2">{timesheet.totalPassengerMiles}</td>
        <td className="border-1 px-2">
          <NumericFormat value={timesheet.totalPerDiem} displayType="text" thousandSeparator prefix="$" decimalScale={2}
                         fixedDecimalScale/>
        </td>
      </tr>
      </tbody>
    </table>
    <div>

    </div>
  </div>;
}
