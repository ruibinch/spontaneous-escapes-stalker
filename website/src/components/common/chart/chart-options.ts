import { ChartOptions as ChartJsOptions, ChartType } from 'chart.js';
import { commonFontProps } from './font';
import { customTooltip } from './tooltip';

type Axes = 'x' | 'y';

interface ChartOptions {
  showLegend?: boolean;
  axesStacked?: Partial<Record<Axes, boolean>>;
  axesGrid?: Partial<Record<Axes, boolean>>;
  axesBorder?: Partial<Record<Axes, boolean>>;
  axesTicks?: Partial<Record<Axes, boolean>>;
  axesTicksOnChartArea?: Partial<Record<Axes, boolean>>;
  axesTickMaxLimit?: Partial<Record<Axes, number>>;
  axesTickLabels?: Partial<Record<Axes, boolean>>;
  axesTickLabelOffset?: Partial<Record<Axes, number>>;
  axesTickLabelRenderFn?: Partial<
    Record<Axes, (value: string, index: number) => string>
  >;
  // Tooltip options
  showTooltipLabelIndicator?: boolean;
  tooltipTitleOverrideMap?: Record<string, string>;
  tooltipLabelSuffix?: string;
  // Plugin options
  lineOnHoverPluginOptions?: Partial<{
    width: number;
    color: string;
    drawOnXAxis: boolean;
    drawOnYAxis: boolean;
  }>;
}

export const makeChartOptions = <T extends ChartType>(
  inputOptions: ChartOptions,
): ChartJsOptions<T> => {
  const options: ChartOptions = {
    showLegend: inputOptions.showLegend ?? false,
    axesStacked: {
      x: inputOptions.axesStacked?.x ?? false,
      y: inputOptions.axesStacked?.y ?? false,
    },
    axesGrid: {
      x: inputOptions.axesGrid?.x ?? true,
      y: inputOptions.axesGrid?.y ?? true,
    },
    axesBorder: {
      x: inputOptions.axesBorder?.x ?? false,
      y: inputOptions.axesBorder?.y ?? false,
    },
    axesTicks: {
      x: inputOptions.axesTicks?.x ?? false,
      y: inputOptions.axesTicks?.y ?? false,
    },
    axesTicksOnChartArea: {
      x: inputOptions.axesTicksOnChartArea?.x ?? false,
      y: inputOptions.axesTicksOnChartArea?.y ?? false,
    },
    axesTickMaxLimit: {
      x: inputOptions.axesTickMaxLimit?.x ?? 10,
      y: inputOptions.axesTickMaxLimit?.y ?? 10,
    },
    axesTickLabels: {
      x: inputOptions.axesTickLabels?.x ?? true,
      y: inputOptions.axesTickLabels?.y ?? true,
    },
    axesTickLabelOffset: {
      x: inputOptions.axesTickLabelOffset?.x ?? 0,
      y: inputOptions.axesTickLabelOffset?.y ?? 0,
    },
    axesTickLabelRenderFn: {
      x: inputOptions.axesTickLabelRenderFn?.x,
      y: inputOptions.axesTickLabelRenderFn?.y,
    },
  };
  const tooltipOptions = {
    showTooltipLabelIndicator: inputOptions.showTooltipLabelIndicator ?? false,
    tooltipTitleOverrideMap: inputOptions.tooltipTitleOverrideMap ?? {},
    tooltipLabelSuffix: inputOptions.tooltipLabelSuffix ?? '',
  };

  // @ts-expect-error hard-to-debug type error
  return {
    plugins: {
      legend: options.showLegend
        ? {
            labels: {
              font: commonFontProps,
            },
          }
        : null,
      tooltip: {
        enabled: false,
        external: (context) => customTooltip(context, tooltipOptions),
        mode: 'index',
        afterLabel: '%',
        intersect: false,
      },
      lineOnHover: inputOptions.lineOnHoverPluginOptions,
    },
    scales: {
      x: {
        stacked: options.axesStacked?.x,
        grid: {
          display: options.axesGrid?.x,
          drawTicks: options.axesTicks?.x,
          drawOnChartArea: options.axesTicksOnChartArea?.x,
          tickColor: 'black',
        },
        border: {
          display: options.axesBorder?.x,
          color: 'black',
        },
        ticks: {
          display: options.axesTickLabels?.x,
          font: commonFontProps,
          color: 'black',
          maxTicksLimit: options.axesTickMaxLimit?.x,
          labelOffset: options.axesTickLabelOffset?.x,
          ...(options.axesTickLabelRenderFn?.x
            ? { callback: options.axesTickLabelRenderFn?.x }
            : {}),
        },
      },
      y: {
        stacked: options.axesStacked?.y,
        grid: {
          display: options.axesGrid?.y,
          drawTicks: options.axesTicks?.y,
          drawOnChartArea: options.axesTicksOnChartArea?.y,
        },
        border: {
          display: options.axesBorder?.y,
        },
        ticks: {
          display: options.axesTickLabels?.y,
          font: commonFontProps,
          color: 'black',
          maxTicksLimit: options.axesTickMaxLimit?.y,
          labelOffset: options.axesTickLabelOffset?.y,
          ...(options.axesTickLabelRenderFn?.y
            ? { callback: options.axesTickLabelRenderFn?.y }
            : {}),
        },
      },
    },
    hover: {
      mode: 'nearest',
      intersect: true,
    },
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 200, // allow DOM to render before attempting redrawing to reduce chances of a weirdly scaled chart
  };
};
