import { Chart, ChartType, TooltipModel } from 'chart.js';
import { commonFontProps } from './font';

export const customTooltip = (
  context: {
    chart: Chart;
    tooltip: TooltipModel<ChartType>;
  },
  opts: {
    showTooltipLabelIndicator: boolean;
    tooltipTitleOverrideMap: Record<string, string>;
    tooltipLabelSuffix: string;
  },
) => {
  const { chart, tooltip } = context;
  const {
    showTooltipLabelIndicator,
    tooltipTitleOverrideMap,
    tooltipLabelSuffix,
  } = opts;
  const tooltipEl = getOrCreateTooltip(chart);

  // hide if no tooltip, e.g. mouse moves out of the chart
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = '0';
    return;
  }

  if (tooltip.body) {
    const titleLines = tooltip.title ?? [];
    const bodyLines = tooltip.body.map((b) => b.lines);

    const tableHeader = document.createElement('thead');

    titleLines.forEach((title) => {
      const tr = document.createElement('tr');
      tr.style.borderWidth = '0px';
      const th = document.createElement('th');
      th.style.borderWidth = '0px';
      th.style.fontSize = '12px';
      const text = document.createTextNode(
        tooltipTitleOverrideMap[title] ?? title,
      );

      th.appendChild(text);
      tr.appendChild(th);
      tableHeader.appendChild(tr);
    });

    const tableBody = document.createElement('tbody');
    bodyLines.forEach((body, i) => {
      const tr = document.createElement('tr');
      tr.style.backgroundColor = 'inherit';
      tr.style.borderWidth = '0px';
      tr.style.fontSize = '12px';

      const td = document.createElement('td');

      const text = document.createTextNode(`${body[0]}${tooltipLabelSuffix}`);

      if (showTooltipLabelIndicator) {
        const colors = tooltip.labelColors[i];
        const span = document.createElement('span');
        span.style.background = colors.backgroundColor as string;
        span.style.marginRight = '8px';
        span.style.height = '8px';
        span.style.width = '8px';
        span.style.borderRadius = '8px';
        span.style.display = 'inline-block';
        td.appendChild(span);
      }
      td.appendChild(text);
      tr.appendChild(td);
      tableBody.appendChild(tr);
    });

    const tableRoot = tooltipEl.querySelector('table');

    // Remove old children
    while (tableRoot && tableRoot.firstChild) {
      tableRoot.firstChild.remove();
    }

    // Add new children
    tableRoot?.appendChild(tableHeader);
    tableRoot?.appendChild(tableBody);
  }

  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

  // Display, position, and set styles for font
  tooltipEl.style.opacity = '1';
  tooltipEl.style.left = `${positionX + tooltip.caretX}px`;
  tooltipEl.style.top = `${positionY + tooltip.caretY}px`;
  tooltipEl.style.font = commonFontProps.family;
  tooltipEl.style.padding = `${tooltip.options.padding}px ${tooltip.options.padding}px`;
};

const getOrCreateTooltip = (chart: Chart) => {
  let tooltipEl = chart.canvas.parentNode?.querySelector('div');

  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.style.background = 'rgba(0, 0, 0, 0.8)';
    tooltipEl.style.borderRadius = '3px';
    // tooltipEl.style.opacity = 1;
    tooltipEl.style.color = 'white';
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.transform = 'translate(-50%, 0)';
    tooltipEl.style.transition = 'all .1s ease';

    const table = document.createElement('table');
    table.style.margin = '0px';

    tooltipEl.appendChild(table);
    chart.canvas.parentNode?.appendChild(tooltipEl);
  }

  return tooltipEl;
};
