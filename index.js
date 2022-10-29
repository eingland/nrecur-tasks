import dotenv from "dotenv";
import { Client } from "@notionhq/client"
import date from 'date-and-time';
import schedule from 'node-schedule';

dotenv.config();
const notion = new Client({ auth: process.env.NOTION_KEY })
const databaseId = process.env.NOTION_DATABASE_ID
const now  =  new Date();

async function getDoneItem() {

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
  const response = await notion.pages.update({
    page_id: item.id,
    properties: {
      'Done': {
        checkbox: false,
      },
      'Due': {
        date: {
            start: date.format(now,'YYYY-MM-DD')
          }
      },
    },
  });
  console.log(response);
  console.log("Updated tasks.");
}

var pages = await getDoneItem();
var tasks = pages.results
console.log(tasks)
tasks.forEach(x => updateItemDue(x));

schedule.scheduleJob('0 0 4 * *', function() {
    console.log('This runs every day at 4:00 AM.');

});