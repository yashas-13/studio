import { ComplianceClient } from "@/components/client/compliance-client";

export default function CompliancePage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Automated Compliance Checks</h1>
      </div>
      <ComplianceClient />
    </div>
  );
}
