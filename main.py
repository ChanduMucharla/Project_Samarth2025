from flask import Flask, render_template, request, jsonify
import pandas as pd, re, os

app = Flask(__name__)
BASE = os.path.dirname(__file__)

# Load data
rainfall_df = pd.read_csv(os.path.join(BASE, 'data', 'rainfall.csv'))
crops_df = pd.read_csv(os.path.join(BASE, 'data', 'crops.csv'))

# ---------------- Utility functions ----------------
def extract_states(text):
    states = set(rainfall_df['State'].unique()) | set(crops_df['State'].unique())
    found = []
    text_lower = text.lower()
    for s in states:
        if s.lower() in text_lower:
            found.append(s)
    return found

def extract_numbers(text):
    nums = re.findall(r'\d+', text)
    return [int(n) for n in nums]

def parse_question(question):
    q = question.lower()
    if 'rain' in q or 'rainfall' in q:
        states = extract_states(q)
        years = extract_numbers(q)
        top_n = re.search(r'top\s*(\d+)', q)
        top_n = int(top_n.group(1)) if top_n else 3
        years = years[0] if years else 3
        if len(states)>=2:
            s1, s2 = states[:2]
        elif len(states)==1:
            s1 = s2 = states[0]
        else:
            s1, s2 = 'Andhra Pradesh', 'Telangana'
        return {'intent':'compare_rainfall_crops', 'state1':s1, 'state2':s2, 'years':years, 'top_n':top_n}

    if ('top' in q and ('crop' in q or 'produce' in q)):
        states = extract_states(q)
        years = extract_numbers(q)
        top_n = re.search(r'top\s*(\d+)', q)
        top_n = int(top_n.group(1)) if top_n else 3
        s = states[0] if states else 'Andhra Pradesh'
        years = years[0] if years else 3
        return {'intent':'top_crops', 'state':s, 'years':years, 'top_n':top_n}

    return {'intent':'unknown'}

# ---------------- Routes ----------------
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/query', methods=['POST'])
def api_query():
    payload = request.json or {}
    question = payload.get('question','').strip()
    if not question:
        return jsonify({'error':'empty question'}), 400

    parsed = parse_question(question)

    if parsed['intent']=='compare_rainfall_crops':
        s1, s2 = parsed['state1'], parsed['state2']
        years, top_n = parsed['years'], parsed['top_n']

        def avg_rain(state, years):
            df = rainfall_df[rainfall_df['State']==state].sort_values('Year')
            if df.empty: return None, []
            arr = df.tail(years)
            return float(arr['Rainfall'].mean()), arr[['Year','Rainfall','Source']].to_dict(orient='records')

        def top_crops(state, years, top_n):
            df = crops_df[crops_df['State']==state]
            if df.empty: return [], []
            df2 = df.sort_values('Year').tail(years) if 'Year' in df.columns else df
            prod = df2.groupby('Crop')['Production'].sum().sort_values(ascending=False)
            top = prod.head(top_n).reset_index().to_dict(orient='records')
            sources = df2['Source'].unique().tolist() if 'Source' in df2.columns else []
            return top, sources

        rf1, src1 = avg_rain(s1, years)
        rf2, src2 = avg_rain(s2, years)
        top1, tsrc1 = top_crops(s1, years, top_n)
        top2, tsrc2 = top_crops(s2, years, top_n)

        response = {
            'question': question,
            'intent': parsed['intent'],
            'state1': {'name':s1,'avg_rainfall': rf1, 'rain_sources': src1, 'top_crops': top1, 'crop_sources': tsrc1},
            'state2': {'name':s2,'avg_rainfall': rf2, 'rain_sources': src2, 'top_crops': top2, 'crop_sources': tsrc2},
        }
        return jsonify(response)

    elif parsed['intent']=='top_crops':
        s, years, top_n = parsed['state'], parsed['years'], parsed['top_n']
        df = crops_df[crops_df['State']==s]
        if df.empty: return jsonify({'error':'no data for state'}), 404
        df2 = df.sort_values('Year').tail(years) if 'Year' in df.columns else df
        prod = df2.groupby('Crop')['Production'].sum().sort_values(ascending=False).head(top_n).reset_index().to_dict(orient='records')
        sources = df2['Source'].unique().tolist() if 'Source' in df2.columns else []
        return jsonify({'question':question,'state':s,'top_crops':prod,'sources':sources})
    
    else:
        return jsonify({'error':'Sorry, only rainfall & top crops questions are supported. Example: "Compare average rainfall in Andhra Pradesh and Telangana for last 3 years and list top 2 crops."'}), 400

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)

