import { Chart } from 'chart.js';

export const covidLinePlugin = {
  id: 'covidLine',
  getLinePositionAndTotalEntries: function (chart: any, pointIndex: number) {
    const meta = chart.getDatasetMeta(0); // first dataset is used to discover X coordinate of a point
    const data = meta.data as Array<{ x: number; y: number }>;
    // Line position is in the middle of pointIndex and (pointIndex + 1)
    const linePosition = (data[pointIndex].x + data[pointIndex + 1].x) / 2;
    return {
      linePosition,
      totalEntries: data.length,
    };
  },
  renderVerticalLine: function (
    chartInstance: Chart,
    lineIndex: number | undefined,
    color: string,
  ) {
    if (lineIndex === undefined) return;

    const { linePosition, totalEntries } = this.getLinePositionAndTotalEntries(
      chartInstance,
      lineIndex,
    );
    const text = 'Covid';

    const area = chartInstance.chartArea;
    const context = chartInstance.ctx;

    if (context !== null) {
      // vertical line
      context.beginPath();
      context.strokeStyle = color;
      context.moveTo(linePosition, area?.top);
      context.lineTo(linePosition, area?.bottom);
      context.stroke();

      // label
      context.fillStyle = color;
      const midpoint = 0.5 * totalEntries;
      context.textAlign = lineIndex < midpoint ? 'left' : 'right';
      const textWithOffset = lineIndex < midpoint ? `  ${text}` : `${text}  `;
      context.fillText(textWithOffset, linePosition, area.top + 6);
    }
  },
  afterDatasetsDraw: function (chart: Chart, _args: any, options: any) {
    this.renderVerticalLine(chart, options.lineIndex, options.color);
  },
};
