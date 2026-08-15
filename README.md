# CardioInsight

A full-stack web application for predicting heart disease risk using machine learning. Built as part of a Data Science and Big Data Analytics project.

---

## Overview

CardioInsight takes patient clinical data as input and returns a heart disease risk prediction along with a calculated risk score. The application stores patient history, provides visual analytics through a dashboard, and displays results in an easy-to-understand format suited for both technical and non-technical users.

---

## Features

- Heart disease prediction using a trained Decision Tree model
- Risk classification: Low, Medium, or High
- Patient registration and record management
- Dashboard with charts (risk distribution, BP frequency, age vs risk)
- 3D animated heart visualization based on patient risk state
- Full clinical report for each patient
- Light and dark mode support

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js |
| Backend | Flask (Python) |
| Machine Learning | Scikit-learn (Decision Tree) |
| Database | MongoDB |
| Charts | Recharts |
| 3D Model | React Three Fiber / Three.js |

---

## Project Structure

```
DSBDA_MiniProject/
├── app.py                    # Flask server and prediction API
├── health_utils.py           # BMI, BP, heart rate classification
├── model.pkl                 # Trained ML model
├── heart.csv                 # Training dataset
├── requirements.txt
└── frontend/
    └── src/
        ├── App.js
        ├── App.css
        ├── Heart3D.jsx
        └── components/
            ├── InputView.jsx
            ├── DashboardView.jsx
            └── PatientDetailView.jsx
```

---

## Installation

**Requirements:** Python 3.9+, Node.js 16+, MongoDB (local or Atlas)

### Backend

```bash
pip install -r requirements.txt
python app.py
```

Server starts at `http://127.0.0.1:5000`

### Frontend

```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:3000`

### MongoDB Setup

Update the connection string in `app.py`:

```python
# Local
client = MongoClient("mongodb://localhost:27017/")

# MongoDB Atlas
client = MongoClient("mongodb+srv://<username>:<password>@cluster0.mongodb.net/cardioinsight")
```

---

## How to Use

1. Open the app and go to **New Check**
2. Fill in the patient's personal details (name, age, gender, contact)
3. Enter the clinical parameters (BP, cholesterol, ECG results, etc.)
4. Submit to get the risk prediction and score
5. View the result on the Dashboard along with charts and the 3D heart model
6. Access full reports or delete records from the patient history sidebar

---

## API Reference

### `POST /predict`

Accepts patient and clinical data, runs the ML model, computes health metrics (BMI, BP, heart rate status), saves the record to MongoDB, and returns the prediction.

**Sample Request:**
```json
{
  "name": "Tejas Tambe",
  "age": 34,
  "sex": 0,
  "cp": 2,
  "trestbps": 130,
  "chol": 250,
  "thalach": 150,
  "oldpeak": 1.4
}
```

**Sample Response:**
```json
{
  "prediction": "Yes",
  "risk_score": 72,
  "risk_level": "High Risk",
  "bmi": 22.66,
  "bp_status": "Elevated",
  "heart_rate_status": "Normal"
}
```

---

### `GET /history`

Returns all saved patient records from MongoDB for display in the dashboard sidebar.

---

### `DELETE /patients/<id>`

Deletes a patient record by its MongoDB document ID.

---

## Model Details

- **Dataset:** UCI Heart Disease Dataset (`heart.csv`)
- **Algorithm:** Decision Tree Classifier
- **Accuracy:** ~84%
- **Input Features:** `age`, `sex`, `cp`, `trestbps`, `chol`, `fbs`, `restecg`, `thalach`, `exang`, `oldpeak`, `slope`, `ca`, `thal`
- **Output:** Binary prediction (`Yes` / `No`) with a derived risk score (0–100)

---

## Future Scope

- Integration with IoT devices for live BP and heart rate monitoring
- Role-based login for doctors and admins
- PDF export for clinical reports
- Upgrade to ensemble models (XGBoost, Random Forest) for improved accuracy
- Mobile application

---

## License

MIT License. Free to use for academic and personal projects.
