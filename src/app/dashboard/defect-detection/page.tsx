import { DefectDetectionClient } from "@/components/client/defect-detection-client";

export default function DefectDetectionPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">AI-Driven Defect Detection</h1>
      </div>
      <DefectDetectionClient />
    </div>
  );
}
