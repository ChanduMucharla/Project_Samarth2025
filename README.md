# Project Samarth – Intelligent Crop & Rainfall Query Assistant

> “Empowering farmers and analysts with data-driven insights through natural language interaction.”

## 📘 Overview
Project Samarth is a lightweight Flask web application that enables users to ask natural language questions about crop production and rainfall trends across Indian states. It integrates NLP parsing, data analytics (via Pandas), and a simple web interface to make agricultural data accessible and interactive.

Example queries:
- “Compare rainfall between Andhra Pradesh and Telangana for the last 3 years.”
- “Show top 5 crops produced in Karnataka.”
- “Which crops have the highest yield in Tamil Nadu?”

## 🧠 Features
-  Compare rainfall between states for recent years
-  View top crops by production in a state
-  Ask questions in plain English (via regex-based NLP)
-  Uses rainfall.csv and crops.csv datasets
-  Simple and extensible Flask architecture

## 🗂️ Folder Structure
```
project_samarth_final/
├── app.py
├── nlp.py
├── requirements.txt
├── data/
│   ├── rainfall.csv
│   └── crops.csv
├── templates/
│   └── index.html
├── static/
└── README.md
```

## ⚙️ Setup and Installation
### 1️⃣ Clone or Extract
```bash
unzip project_samarth_final.zip
cd project_samarth_final
```

### 2️⃣ Create a Virtual Environment
```bash
python -m venv venv
source venv/bin/activate      # Linux / Mac
venv\Scripts\activate       # Windows
```

### 3️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```

### 4️⃣ Run the Flask App
```bash
python app.py
```

### 5️⃣ Open the Web Interface
Visit http://127.0.0.1:5000/

## 🔗 API Reference
### POST /api/query
**Description:** Processes a natural-language question and returns structured JSON data.

**Request:**
```json
{
  "question": "Compare rainfall between Andhra Pradesh and Telangana for 5 years"
}
```

**Response:**
```json
{
  "intent": "compare_rainfall_crops",
  "state1": "Andhra Pradesh",
  "state2": "Telangana",
  "years": 5,
  "top_n": 3
}
```

## 🧾 Dataset Information
### rainfall.csv
| Column | Description |
|--------|-------------|
| State | Name of Indian state |
| Year | Year of recorded rainfall |
| Rainfall | Average rainfall in mm |
| Source | Data source |

### crops.csv
| Column | Description |
|--------|-------------|
| State | Name of Indian state |
| Crop | Crop name |
| Production | Quantity produced |
| Year | Year of record |

## 🧩 Future Enhancements
- Integrate spaCy or NLTK for advanced NLP
- Add visualization charts (rainfall trends)
- Add REST API endpoints for external integrations
- Implement authentication

## 👥 Contributors
- ChanduMucharla/chandumucharla09@gmail.com
Developed for educational and research purposes.

## 🪪 License
Licensed under the MIT License.
