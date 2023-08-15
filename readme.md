Node.js app to run scheduled task to update notion database with recurring tasks.

## How to use

To use you you need a private Notion integration and key as well the id section of the database url to update. Also the integration assumes properites Due (Date), 'Recur Interval' (Number), 'Recur Type' (Select) and Done (Checkbox) exist in the database being updated. I'm updating a database based on this [Notion Template](https://www.notion.so/Simple-Recurring-Task-Dates-2020-01101ca280f74efb937488d468ffbaac). Timezone of Notion settings and TZ environment variable must be the same.

It is set to run every 30 minutes and will update any row that has done checked and a due date that is that day or earlier and update by the number in the interval property and the type of recurance (Daily, Weekly, Monthly, or Yearly).

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
docker pull ghcr.io/eingland/nrecur-tasks:latest
docker compose up -d
```

### Docker Build

Using Github Actions to push to registry