const { Client } = require("@notionhq/client");

exports.handler = async function(event, context) {
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const notion = new Client({ auth: NOTION_TOKEN });

  try {
    const { databaseId } = JSON.parse(event.body);
    const response = await notion.databases.query({ database_id: databaseId });
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
