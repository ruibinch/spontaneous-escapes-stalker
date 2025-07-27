# Railway Deployment Guide

This project is configured to run on Railway with automated cron jobs for scraping Spontaneous Escapes data.

## Configuration Files

- `railway.toml` - Main Railway configuration with cron services
- `nixpacks.toml` - Build configuration for Puppeteer dependencies
- `.railwayignore` - Files to exclude from deployment

## Cron Jobs

The configuration sets up two cron services:

1. **Regular Schedule** (`spontaneous-escapes-stalker`):
   - Runs every 30 minutes from 7am to 11pm on weekdays
   - Uses `MAX_DELAY_SECS=300` for longer delays

2. **Intensive Schedule** (`spontaneous-escapes-stalker-intensive`):
   - Runs every 5 minutes from 7am to 11pm on weekdays (15th-31st of each month)
   - Uses `MAX_DELAY_SECS=80` for shorter delays during peak periods

## Notes

- The cron jobs will only run on weekdays (Monday-Friday)
- Puppeteer dependencies (Chromium) are automatically installed
- The service will restart on failure
- Logs are automatically sent via the existing logging system
