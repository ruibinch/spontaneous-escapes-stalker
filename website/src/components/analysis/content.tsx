import { RedemptionHistoryChart } from './redemption-history-chart';

export function AnalysisContent() {
  return (
    <div className="h-full lg:px-6">
      <div className="flex justify-center pt-16 px-4 lg:px-0 flex-wrap xl:flex-nowrap max-w-[90rem] mx-auto w-full">
        <div className="gap-16 flex flex-col w-full pb-8 border-b">
          <div className="h-full flex flex-col gap-2">
            <h3 className="text-xl font-semibold">
              Distribution by flight class
            </h3>
            <div className="w-full bg-default-50 shadow-md p-6 rounded-lg">
              <RedemptionHistoryChart />
            </div>
          </div>

          <div className="h-full flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Distribution by region</h3>
            <div className="w-full bg-default-50 shadow-md p-6 rounded-lg">
              {/* TODO: */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
