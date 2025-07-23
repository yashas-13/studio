import { ForecastingClient } from "@/components/client/forecasting-client";

export default function ForecastingPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Material Forecasting</h1>
      </div>
      <ForecastingClient />
    </div>
  );
}
