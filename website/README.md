# KrisFlyer Spontaneous Escapes Analysis Tool (SEAT)

A site for analysing historical KrisFlyer Spontaneous Escapes flight redemptions.

The list of redemptions is scraped from the live and archived versions of the KrisFlyer Spontaneous Escapes page as well as parsing the data published on the MileLion/MainlyMiles blogs for older releases.

## Features

- **Playground**
  - Explore the full dataset of past SE redemptions with filters on:
    - City
    - Country
    - Airport IATA code
    - Region
    - Flight class
    - Month
    - Period range
- **Analysis**
  - Provides analysis on segments of the data, e.g. comparison of SE trends, blackout percentages, and route network coverage
- **View by Month**
  - Explore redemptions for a specific month, with similar accompanying filters as that available on the Playground page
- **View by Route**
  - Drill down on specific city pairs to check how often and when they appeared in Spontaneous Escapes, along with route-specific stats

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- Next.js 14
- React 18
- Tailwind CSS
- Chart.js (via react-chartjs-2)
- Deployed on Vercel
