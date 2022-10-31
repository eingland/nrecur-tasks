import dotenv from "dotenv";
import { Client } from "@notionhq/client"
import date from 'date-and-time';
import cron from 'node-cron';

dotenv.config();
const notion = new Client({ auth: process.env.NOTION_KEY })
const databaseId = process.env.NOTION_DATABASE_ID

async function getDoneItem() {
  const now  =  new Date();
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
                    on_or_before: date.format(now,'YYYY-MM-DD'),
                  }
                },
                {
                  property: 'Recur Interval (Days)',
                  number: {
                    greater_than_or_equal_to: 1,
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
  console.log(item.properties.Due.date)
  var oldDate = new Date(item.properties.Due.date.start);
  var newDate = date.addDays(oldDate, item.properties['Recur Interval (Days)'].number);
  newDate = date.addHours(newDate, process.env.TIMEZONE_HOUR_OFFSET );
  const response = await notion.pages.update({
    page_id: item.id,
    properties: {
      'Done': {
        checkbox: false,
      },
      'Due': {
        date: {
            start: newDate,
            time_zone: process.env.TIMEZONE
          }
      },
    },
  });
  console.log(response);
  console.log("Updated tasks.");
}

async function main() {
  
  var pages = await getDoneItem();
    var tasks = pages.results
    if (tasks.length > 0)
      tasks.forEach(x => updateItemDue(x));
    else
      console.log("No tasks to update.")
}

cron.schedule('*/30 * * * *', async function() {
    console.log('This runs every 30 minutes.');
    main();
});

if (process.env.ENVIRONMENT == "Development")
{
  main();
}