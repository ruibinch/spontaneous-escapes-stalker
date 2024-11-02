import fs from 'fs';

const WEBSITE_DATA_FILES = [
  /route-analysis.json/,
  /month-summary-analysis.json/,
  /.*-redemptions-postprocessed.json/,
  /route-.*.json/,
];

export async function copyDataFilesToWebsiteFolder() {
  const dataFiles = fs.readdirSync('data');

  dataFiles.forEach((dataFile) => {
    if (WEBSITE_DATA_FILES.some((regex) => regex.test(dataFile))) {
      const fileContent = fs.readFileSync(`data/${dataFile}`).toString();
      const fileContentMinified = JSON.stringify(JSON.parse(fileContent));
      fs.writeFileSync(`website/src/static/${dataFile}`, fileContentMinified);
    }
  });
}

(async () => {
  if (require.main === module) {
    await copyDataFilesToWebsiteFolder();
  }
})();
