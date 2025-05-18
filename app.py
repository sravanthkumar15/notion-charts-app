from flask import Flask, render_template, request, jsonify
from notion_client import Client
import os
import pandas as pd
import plotly.express as px
import json

app = Flask(__name__)

# Initialize Notion client
notion = Client(auth=os.getenv('NOTION_TOKEN'))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_chart', methods=['POST'])
def generate_chart():
    try:
        data = request.json
        database_id = data.get('database_id')
        
        # Get database data from Notion
        results = notion.databases.query(
            **{
                "database_id": database_id,
            }
        )
        
        # Convert Notion results to DataFrame
        records = []
        for item in results.get('results', []):
            properties = item.get('properties', {})
            record = {}
            for prop_name, prop_value in properties.items():
                if prop_value.get('type') == 'rich_text':
                    record[prop_name] = prop_value['rich_text'][0]['plain_text']
                elif prop_value.get('type') == 'number':
                    record[prop_name] = prop_value['number']
                elif prop_value.get('type') == 'select':
                    record[prop_name] = prop_value['select']['name']
            records.append(record)
        
        df = pd.DataFrame(records)
        
        # Generate chart (example: bar chart)
        fig = px.bar(df, x=df.columns[0], y=df.columns[1])
        
        # Return chart as JSON
        chart_json = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
        
        return jsonify({
            'success': True,
            'chart': chart_json,
            'embed_code': '<iframe src="http://localhost:5000/chart/' + database_id + '" width="100%" height="400"></iframe>'
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/chart/<database_id>')
def chart(database_id):
    return render_template('chart.html', database_id=database_id)

if __name__ == '__main__':
    app.run(debug=True)
