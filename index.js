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
  var oldDate = new Date(item.properties.Due.date.start);

  if (item.properties['Recur Type'].select.name == "Daily")
  {
    var newDate = date.addDays(oldDate, item.properties['Recur Interval'].number);
  } else if (item.properties['Recur Type'].select.name == "Weekly")
  {
    var newDate = date.addDays(oldDate, item.properties['Recur Interval'].number * 7);
  } else if (item.properties['Recur Type'].select.name == "Monthly")
  {
    var newDate = date.addMonths(oldDate, item.properties['Recur Interval'].number);
  } else if (item.properties['Recur Type'].select.name == "Yearly")
  {
    var newDate = date.addYears(oldDate, item.properties['Recur Interval'].number);
  }
  
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
    if (pages)
    {
      var tasks = pages.results
      if (tasks.length > 0)
        tasks.forEach(x => updateItemDue(x));
      else
        console.log("No tasks to update.")
    }
    else
    {
      console.log("No response from API.")
    }
}

cron.schedule('*/30 * * * *', async function() {
    console.log('This runs every 30 minutes.');
    main();
});

if (process.env.ENVIRONMENT == "Development")
{
  main();
}