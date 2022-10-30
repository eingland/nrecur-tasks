Node.js app to run scheduled task to update notion database with recurring tasks.

## How to use

To use you you need a private Notion integration and key as well the id section of the database url to update. Also the integration assumes properites Due (Date), 'Recur Interval (Days)' (Number) and Done (Checkbox) exist in the database being updated. I'm updating a database based on this [Notion Template](https://www.notion.so/Simple-Recurring-Task-Dates-2020-01101ca280f74efb937488d468ffbaac).

It is set to run every 30 minutes and will update any row that has done checked and a due date that is that day or earlier and update by the number of days in the interval property.

Copy .env.example to .env and fill out values

### Run Local

Run 
```
npm install
```
Then run 
```
npm start
```

### Run with Docker

```
docker pull eingland/nrecur-tasks:latest
docker compose up -d
```