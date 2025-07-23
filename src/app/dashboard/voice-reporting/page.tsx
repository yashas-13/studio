import { VoiceReportingClient } from "@/components/client/voice-reporting-client";

export default function VoiceReportingPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Voice-Activated Reporting</h1>
      </div>
      <VoiceReportingClient />
    </div>
  );
}
