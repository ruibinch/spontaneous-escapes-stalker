/**
 * Returns the list of months present in the dataset.
 */
export function getMonthsList(): string[] {
  // TODO: fetch from route-analysis.json and not hardcode here
  return [
    '201711',
    '201712',
    '201801',
    '201803',
    '201804',
    '201805',
    '201806',
    '201807',
    '201808',
    '201809',
    '201810',
    '201811',
    '201812',
    '201901',
    '201902',
    '201903',
    '201904',
    '201905',
    '201906',
    '201907',
    '201908',
    '201909',
    '201910',
    '201911',
    '201912',
    '202001',
    '202002',
    '202003',
    '202204',
    '202205',
    '202206',
    '202207',
    '202208',
    '202209',
    '202210',
    '202211',
    '202212',
    '202301',
    '202302',
    '202303',
    '202304',
    '202305',
    '202306',
    '202307',
    '202308',
    '202309',
    '202310',
    '202311',
    '202312',
    '202401',
    '202402',
    '202403',
    '202404',
    '202405',
    '202406',
    '202407',
    '202408',
    '202409',
    '202410',
    '202411',
    '202412',
    '202501',
    '202502',
    '202503',
    '202504',
    '202505',
    '202506',
    '202507',
  ];
}

/**
 * Returns the list of years present in the dataset.
 * 2021 is manually added as there were no offers during the Covid period.
 */
export function getYearsList() {
  const monthsList = getMonthsList();
  const yearsSet = monthsList.reduce((_yearsSet, yyyymm) => {
    _yearsSet.add(yyyymm.slice(0, 4));
    return _yearsSet;
  }, new Set<string>(['2021']));
  return [...Array.from(yearsSet)].sort();
}
