import CronTesterClient from "./CronTesterClient";

export const metadata = {
  title: "Free Cron Job Tester - Validate & Parse Cron Expressions Online",
  description: "Test your cron expressions online. Instantly see human-readable descriptions and the next 10 scheduled execution times. Real-time validation.",
  keywords: ["cron tester", "cron expression parser", "cron job checker", "cronstrue", "crontab generator", "cron validator online", "cron expression test", "cron schedule"],
  openGraph: {
    title: "Free Cron Job Tester - Parse Cron Expressions",
    description: "Instantly parse any cron expression to a human-readable description and see its next scheduled execution times.",
    type: "website",
  },
};

export default function CronTesterPage() {
  return <CronTesterClient />;
}
