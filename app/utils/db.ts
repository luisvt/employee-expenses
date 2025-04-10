import Dexie, { type Table } from 'dexie';
import type { Employee } from '~/models/employee';
import type { Job } from '~/models/job';
import type { Timesheet } from '~/models/timesheet';

// Initialize the database
class MyDatabase extends Dexie {
  employees!: Table<Employee, number>;
  jobs!: Table<Job, number>;
  timesheets!: Table<Timesheet, number>;

  constructor() {
    super('TimesheetsDB');
    this.version(1).stores({
      employees: '++id, name',
      jobs: '++id, name, costCode',
      timesheets: '++id, weekRangeDates, employeeId, expenses'
    });
  }
}

const db = new MyDatabase();
export default db;
