import axios from 'axios';
import fs from 'fs';
import { HTMLElement, parse } from 'node-html-parser';
import * as puppeteer from 'puppeteer';
import { log } from './utils/log';

const SPONTANEOUS_ESCAPES_URL =
  'https://www.singaporeair.com/en_UK/sg/plan-travel/promotions/global/kf/kf-promo/kfescapes/';

/**
 * Fetches the latest HTML content from the SE webpage, or loads a local HTML file specified by the HTML_FILEPATH env var.
 */
export async function loadHtml({
  htmlFilepath,
  shouldUsePuppeteer,
}: {
  htmlFilepath: string | undefined;
  shouldUsePuppeteer: boolean;
}): Promise<{
  html: HTMLElement;
  isNewHtml: boolean;
}> {
  if (htmlFilepath) {
    const htmlFileContent = fs.readFileSync(htmlFilepath).toString();
    return { html: parse(htmlFileContent), isNewHtml: false };
  }

  if (shouldUsePuppeteer) {
    const html = await loadHtmlViaPuppeteer();
    if (html) {
      return { html, isNewHtml: true };
    }
  }

  // fallback to a basic GET request
  // but this can result in missing extractions of table details
  const response = await axios.get(SPONTANEOUS_ESCAPES_URL, {
    headers: {
      'User-Agent': 'PostmanRuntime/7.33.0',
    },
    timeout: 20000,
  });
  return { html: parse(response.data), isNewHtml: true };
}

/**
 * Load HTML via Puppeteer, and extract out only the table elements.
 */
async function loadHtmlViaPuppeteer() {
  log('Loading HTML via Puppeteer');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  // this is required to avoid ERR_HTTP2_PROTOCOL_ERROR
  page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
  );
  await page.goto(SPONTANEOUS_ESCAPES_URL);

  const tableHandles = await page.$$('.table-inner');
  const tables = await Promise.all(
    tableHandles.map(async (container) => {
      const tableHtml: string = await container.$eval('table', (table) => {
        // returns <thead> and <tbody> elements
        return table.innerHTML;
      });
      // re-wrap with <table> tags
      return `<table>${tableHtml}</table>`;
    }),
  );
  await browser.close();

  // wrap with <html> tags to make it a valid HTML document for parsing
  const html = `<html>${tables.join('\n')}</html>`;
  return parse(html);
}
