# Notion Chart Generator

An application that converts Notion database data into beautiful charts that can be embedded back into Notion pages.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file in the root directory with your Notion API token:
```
NOTION_TOKEN=your_notion_api_token_here
```

3. Run the application:
```bash
python app.py
```

## Usage

1. Open your browser and navigate to `http://localhost:5000`
2. Enter your Notion Database ID
3. Click "Generate Chart"
4. Copy the embed code and paste it into your Notion page

## Features

- Converts Notion database data into interactive charts
- Supports multiple chart types (bar, line, pie)
- Generates embeddable iframe code for Notion
- Responsive design
- Real-time chart updates
