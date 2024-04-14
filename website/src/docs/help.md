## What is this site about?

SIA runs a monthly Spontaneous Escapes (SE) promotion, where the number of miles required for a ticket redemption in the following month is reduced, typically by 30%. The routes available for redemption vary on a monthly basis as they are determined by load factor, i.e. the greater the number of unsold seats on the route, the higher the chance of the route appearing on SE.

This site collates the historical SE redemptions data and presents it in an easily accessible and searchable format with accompanying charts for derivation of insights and potentially predictions of future redemptions.

A more in-depth writeup of this site is featured in [this MileLion article](https://milelion.com/2024/04/07/now-live-krisflyer-spontaneous-escapes-analysis-tool-seat/).

## Where does this data come from?

A combination of scraping the live and archived versions of the [KrisFlyer Spontaneous Escapes page](https://www.singaporeair.com/en_UK/sg/plan-travel/promotions/global/kf/kf-promo/kfescapes/) as well as parsing the data published on the [MileLion](https://milelion.com/?s=spontaneous)/[MainlyMiles](https://mainlymiles.com/?s=spontaneous) blogs for older releases.

Each individual redemption is parsed into a JSON structure to facilitate further data manipulation and analysis.

```json
{
  "origin": "Singapore",
  "originIata": "SIN",
  "originCountry": "Singapore",
  "destination": "Bali",
  "destinationIata": "DPS",
  "destinationCountry": "Indonesia",
  "flightClass": "Economy",
  "flightNos": ["SQ938", "SQ944"],
  "milesRequired": 5250,
  "blackoutPeriod": [
    {
      "from": "2022-05-26",
      "to": "2022-05-26"
    }
  ],
  "region": "South East Asia",
  "redemptionMonth": "202205"
}
```

## What is the timeframe of this dataset?

The Spontaneous Escapes program began in Sep-2017.

The list of months with no redemptions from then till present are:

- Feb-2018
- Apr-2020 to Mar-2022 (Covid era)

## What does the data for each month represent?

The month represents the travel period, e.g. May 2022 refers to redemptions that are valid for travel in May 2022.

The list of redemptions is typically published in the previous month from the travel month, however there are some exceptions - e.g. the set of redemptions released in Mar 2022 had a valid travel period of 1 Apr - 30 May 2022, in which case the list of redemptions are duplicated across both Apr and May 2022.

## Does the dataset include SilkAir redemptions before it merged with SIA in end-2021?

Yes, so as to have a more representative dataset, especially for months further back in the past where SilkAir redemptions formed the majority of the redemptions list.

## Is this site affliated with SIA?

No, it's just a personal side project to aid in squeezing out more value of every mile.

## I have an idea for an additional feature!

Feel free to reach out via the [Feedback page](/feedback).
