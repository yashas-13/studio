import { WasteReductionClient } from "@/components/client/waste-reduction-client";

export default function WasteReductionPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Waste Reduction Analysis</h1>
      </div>
      <WasteReductionClient />
    </div>
  );
}
