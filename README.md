# GPU Server WebApp

This repository contains the code for the web application, meaning, the frontend (user visible) and the backend (database etc interaction). It is written in [Next.js](https://nextjs.org/).

## First setup

Before you can develop this repo locally, you follow a few steps:

1. Install PostgreSQL.
2. Copy the `.env.example` to `.env` and fill in the properties. (see Discord for credentials)
3. Install NodeJS
4. Run `npm install` to install the dependencies.

## Local development

1. Make sure the PostgreSQL database is running.
2. Run `npm run dev`, the web application will start. Go to https://localhost:5001 in your browser. If you make a code change, this will immediately be updated in the browser.

## Database modifications

When you adjust the database schema (`prisma/schema.prisma`), you must update the local database using migrations.

Run the following commands to update your local database:

-   `npx prisma migrate dev`
-   `npx prisma generate`
