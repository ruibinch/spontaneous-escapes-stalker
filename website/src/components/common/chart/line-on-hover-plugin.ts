export const lineOnHoverPlugin = {
  id: 'lineOnHover',
  defaults: {
    width: 1,
    color: '#000',
    drawOnXAxis: true,
    drawOnYAxis: false,
  },
  afterInit: (chart: any) => {
    chart.lineOnHover = {
      x: 0,
      y: 0,
    };
  },
  afterEvent: (chart: any, args: any) => {
    const { inChartArea } = args;
    const { x, y } = args.event;

    chart.lineOnHover = { x, y, draw: inChartArea };
    chart.draw();
  },
  beforeDatasetsDraw: (chart: any, _args: any, opts: any) => {
    const { ctx } = chart;
    const { top, bottom, left, right } = chart.chartArea;
    const { x, y, draw } = chart.lineOnHover;
    if (!draw) return;

    ctx.save();

    ctx.beginPath();
    ctx.lineWidth = opts.width;
    ctx.strokeStyle = opts.color;
    if (opts.drawOnXAxis) {
      ctx.moveTo(x, bottom);
      ctx.lineTo(x, top);
    }
    if (opts.drawOnYAxis) {
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
    }
    ctx.stroke();

    ctx.restore();
  },
};
