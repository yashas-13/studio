
import { ProgressReportingClient } from "@/components/client/progress-reporting-client";

export default function ProgressReportingPage() {
  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Progress Reporting</h1>
        </div>
        <ProgressReportingClient />
    </div>
  );
}
