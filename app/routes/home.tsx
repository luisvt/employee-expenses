import { Card } from "primereact/card";
import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Tooltip } from "primereact/tooltip";
import { useLiveQuery } from "dexie-react-hooks";
import db from "~/utils/db";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const timesheets = useLiveQuery(() => db.timesheets.toArray(), [], []);

  return <div className="flex flex-col h-full">
    <div className="flex flex-row items-center p-4 bg-gray-200 gap-4">
      <h1 className="text-4xl font-bold flex-1">Home</h1>
      <Tooltip target="#add-timesheet" content="Add Timesheet" position="left" />
      <Link to="/timesheet" id="add-timesheet" className="p-button p-button-primary p-button-icon-only">
        <span className="pi pi-plus p-button-icon" />
        <span className="p-button-label">&nbsp</span>
      </Link>
    </div>
    <div className="flex-1 h-full overflow-auto px-4 flex flex-col gap-4">
      {timesheets.map((timesheet) => (
        <Card key={timesheet.id} header={weekRangeDatesToString(timesheet.weekRangeDates)}>
          <div className="flex flex-row justify-between">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold">{timesheet.employee?.name}</h2>
              <p>{weekRangeDatesToString(timesheet.weekRangeDates)}</p>
            </div>
            <Link to={`/timesheet/${timesheet.id}`} className="p-button p-button-secondary p-button-icon-only">
              <span className="pi pi-pencil p-button-icon" />
              <span className="p-button-label">&nbsp</span>
            </Link>
          </div>
        </Card>))}

    </div>
    <div className="footer">
      <p className="text-sm">© 2023 Your Company</p>
    </div>
  </div>;
}

function weekRangeDatesToString(weekRangeDates: Date[]) {
  const start = weekRangeDates[0].toLocaleDateString();
  const end = weekRangeDates[weekRangeDates.length - 1].toLocaleDateString();
  return `${start} - ${end}`;
}
