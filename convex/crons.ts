import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.hourly(
  "check missed logs",
  { minuteUTC: 0 }, // run at the top of every hour
  internal.notifications.checkAndNudge,
);

export default crons;