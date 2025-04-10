import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  // route("timesheet", "routes/timesheet-form.tsx"),
  route("timesheet/:id?", "routes/timesheet-form.tsx"),
] satisfies RouteConfig;
