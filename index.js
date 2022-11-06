import dotenv from "dotenv";
import { Client } from "@notionhq/client"
import date from 'date-and-time';
import cron from 'node-cron';

dotenv.config();
const notion = new Client({ auth: process.env.NOTION_KEY })
const databaseId = process.env.NOTION_DATABASE_ID

async function getDoneItem() {
  const now = new Date();
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: 'Done',
            checkbox: {
              equals: true,
            },
          },
          {
            property: 'Due',
            date: {
              on_or_before: date.format(now, 'YYYY-MM-DD'),
            }
          },
          {
            property: 'Recur Interval',
            number: {
              greater_than_or_equal_to: 1,
            },
          },
          {
            property: 'Recur Type',
            select: {
              is_not_empty: true,
            },
          },
        ],
      },
    });
    console.log("Retrieved tasks.");
    return response
  } catch (error) {
    console.error(error.body);
  }
}

async function updateItemDue(item) {
  var oldDateUTC = new Date(item.properties.Due.date.start);

  if (item.properties['Recur Type'].select.name == "Daily") {
    var newDateUTC = date.addDays(oldDateUTC, item.properties['Recur Interval'].number);
  } else if (item.properties['Recur Type'].select.name == "Weekly") {
    var newDateUTC = date.addDays(oldDateUTC, item.properties['Recur Interval'].number * 7);
  } else if (item.properties['Recur Type'].select.name == "Monthly") {
    var newDateUTC = date.addMonths(oldDateUTC, item.properties['Recur Interval'].number);
  } else if (item.properties['Recur Type'].select.name == "Yearly") {
    var newDateUTC = date.addYears(oldDateUTC, item.properties['Recur Interval'].number);
  }

  // Manually add offset to time to convert to local timezone in a UTC date
  var newDateLocal = date.addMinutes(newDateUTC, -newDateUTC.getTimezoneOffset());

  const response = await notion.pages.update({
    page_id: item.id,
    properties: {
      'Done': {
        checkbox: false,
      },
      'Due': {
        date: {
          start: newDateLocal,
          time_zone: process.env.TZ
        }
      },
    },
  });
  console.log("Updated tasks.");
}

async function main() {

  var pages = await getDoneItem();
  if (pages) {
    var tasks = pages.results
    if (tasks.length > 0)
      tasks.forEach(x => updateItemDue(x));
    else
      console.log("No tasks to update.")
  }
  else {
    console.log("No response from API.")
  }
}

main();

if (process.env.ENVIRONMENT != "Development") {
  cron.schedule('*/30 * * * *', async function () {
    console.log('This runs every 30 minutes.');
    main();
  });
}