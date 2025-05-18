import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Client } from '@notionhq/client';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const notion = new Client({ auth: process.env.NOTION_TOKEN });

app.post('/api/fetch-database', async (req, res) => {
  try {
    const { databaseId } = req.body;
    const response = await notion.databases.query({ database_id: databaseId });
    res.json({ success: true, data: response.results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/embed', (req, res) => {
  res.sendFile(process.cwd() + '/server/embed.html');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
