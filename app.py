# ============================================================
#  app.py
#  Heart Disease Prediction Project -- Flask REST API
#
#  Routes:
#    GET  /          --> returns plain status string
#    POST /predict   --> accepts JSON or form data, runs model,
#                        returns JSON prediction result
#
#  Dependencies:
#    pip install flask flask-cors
#    model.pkl and health_utils.py must be in the same folder
# ============================================================

from flask import Flask, request, jsonify
from flask_cors import CORS          # Allows cross-origin requests (frontend on any port)
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
import pickle
import os

# Import our custom health analysis functions
from health_utils import generate_health_report

# ============================================================
#  APP INITIALISATION
# ============================================================

app = Flask(__name__)
CORS(app)                            # Enable CORS for all routes

# ============================================================
#  MONGODB SETUP
# ============================================================

try:
    mongo_client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=2000)
    db = mongo_client["heart_app"]
    patients_collection = db["patients"]
    
    # Quick test to confirm connection
    mongo_client.server_info()
    print("[OK] Connected to MongoDB database 'heart_app'.")
except Exception as e:
    patients_collection = None
    print("[WARNING] Could not connect to MongoDB. Predictions will not be saved. Error:", e)


# ============================================================
#  LOAD MODEL AT STARTUP
#  We load model.pkl once when the server starts, not on every
#  request — this is faster and more efficient.
# ============================================================

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    print("[OK] model.pkl loaded successfully.")
except FileNotFoundError:
    model = None
    print("[ERROR] model.pkl not found! Run heart_analysis.py first.")


# ============================================================
#  ROUTE 1 : HOME  "/"
#  Simple health-check endpoint — confirms the API is live.
# ============================================================

@app.route("/", methods=["GET"])
def home():
    """API status check."""
    return "API is running", 200


# ============================================================
#  ROUTE 2 : PREDICT  "/predict"  (POST only)
#  Accepts form-encoded or JSON body, validates inputs, runs
#  the model via generate_health_report(), and returns JSON.
# ============================================================

@app.route("/predict", methods=["POST"])
def predict():
    """
    Accept POST data and return a JSON health analysis report.

    Accepts either:
      - application/x-www-form-urlencoded  (HTML form)
      - application/json                   (fetch / Axios from frontend)

    Returns JSON:
      {
        "prediction", "risk_score", "risk_level",
        "bmi", "bmi_category",
        "bp_status", "heart_rate_status",
        "recommendation"
      }
    """

    # Guard: model must be loaded before we can predict
    if model is None:
        return jsonify({
            "error": "Model not loaded. Run heart_analysis.py first."
        }), 500

    try:
        # --------------------------------------------------
        #  STEP 1 : READ INPUTS
        #  Support both JSON body (fetch API) and form data
        #  (HTML form) so the same endpoint works for both.
        # --------------------------------------------------

        # If the client sends Content-Type: application/json, use that;
        # otherwise fall back to the HTML form fields.
        if request.is_json:
            data = request.get_json(force=True)  # parse JSON body
        else:
            data = request.form                  # parse form fields

        # Helper: get a value from whichever source was used
        def get(key, default=0):
            return data.get(key, default)

        # --- Core model features (must match training column order) ---
        inputs = {
            "age"      : int(float(get("age",      0))),
            "sex"      : int(float(get("sex",      0))),
            "cp"       : int(float(get("cp",       0))),
            "trestbps" : int(float(get("trestbps", 0))),
            "chol"     : int(float(get("chol",     0))),
            "fbs"      : int(float(get("fbs",      0))),
            "restecg"  : int(float(get("restecg",  0))),
            "thalach"  : int(float(get("thalach",  0))),
            "exang"    : int(float(get("exang",    0))),
            "oldpeak"  : float(get("oldpeak",  0.0)),
            "slope"    : int(float(get("slope",    0))),
            "ca"       : int(float(get("ca",       0))),
            "thal"     : int(float(get("thal",     0))),
            # Extra fields used by health_utils (not model features)
            "height_cm": float(get("height", 0.0)),
            "weight_kg": float(get("weight", 0.0)),
        }

        # --------------------------------------------------
        #  STEP 2 : INPUT VALIDATION
        #  Return a 400 Bad Request with an error message
        #  so the frontend can display it cleanly.
        # --------------------------------------------------

        if not (1 <= inputs["age"] <= 120):
            raise ValueError("Age must be between 1 and 120.")
        if not (50 <= inputs["trestbps"] <= 250):
            raise ValueError("Blood pressure must be between 50 and 250 mm Hg.")
        if not (50 <= inputs["chol"] <= 600):
            raise ValueError("Cholesterol must be between 50 and 600 mg/dl.")
        if not (40 <= inputs["thalach"] <= 230):
            raise ValueError("Max heart rate must be between 40 and 230 bpm.")

        # --------------------------------------------------
        #  STEP 3 : GENERATE HEALTH REPORT
        #  health_utils.generate_health_report() handles:
        #    - Model prediction + probability
        #    - BMI, BP, HR classification
        #    - Risk level + recommendation text
        # --------------------------------------------------

        report = generate_health_report(inputs, model, scaler=None)

        # --------------------------------------------------
        #  STEP 4 : SAVE TO MONGODB
        #  Store the inputs, prediction results, patient info, and timestamp
        # --------------------------------------------------
        
        if patients_collection is not None:
            db_record = {
                "name"             : get("name", ""),
                "phone"            : get("phone", ""),
                "address"          : get("address", ""),
                "gender"           : get("gender", ""),
                "age"              : inputs["age"],
                "medicalData"      : inputs,
                "inputs"           : inputs, # Backwards compatibility
                "prediction"       : report["prediction"],
                "risk_score"       : report["risk_score"],
                "risk_level"       : report["risk_level"],
                "bmi"              : report["bmi"],
                "bmi_category"     : report["bmi_category"],
                "bp_status"        : report["bp_status"],
                "heart_rate_status": report["heart_rate_status"],
                "recommendation"   : report["recommendation"],
                "timestamp"        : datetime.utcnow()
            }
            try:
                patients_collection.insert_one(db_record)
            except Exception as e:
                print(f"[WARNING] Failed to save record to MongoDB: {e}")

        # --------------------------------------------------
        #  STEP 5 : RETURN JSON RESPONSE
        #  jsonify() sets Content-Type: application/json
        #  and HTTP 200 automatically.
        # --------------------------------------------------

        return jsonify({
            "prediction"       : report["prediction"],
            "risk_score"       : report["risk_score"],
            "risk_level"       : report["risk_level"],
            "bmi"              : report["bmi"],
            "bmi_category"     : report["bmi_category"],
            "bp_status"        : report["bp_status"],
            "heart_rate_status": report["heart_rate_status"],
            "recommendation"   : report["recommendation"],
        }), 200

    except ValueError as ve:
        # Validation error — client sent bad values
        return jsonify({"error": str(ve)}), 400

    except Exception as e:
        # Unexpected server-side error
        return jsonify({"error": "Server error: {}".format(str(e))}), 500




# ============================================================
#  ROUTE 4 : HISTORY  "/history"  (GET only)
#  Returns the last 10 patient records from MongoDB.
# ============================================================

@app.route("/history", methods=["GET"])
def history():
    """Return the last 10 prediction records saved in MongoDB."""
    
    if patients_collection is None:
        return jsonify({"error": "Database not connected"}), 500
        
    try:
        # Find all records, sort by timestamp descending (-1), limit to 10
        cursor = patients_collection.find().sort("timestamp", -1).limit(10)
        
        records = []
        for doc in cursor:
            # Convert ObjectId to string so it serializes to JSON
            doc["_id"] = str(doc["_id"])
            records.append(doc)
            
        return jsonify(records), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve history: {e}"}), 500


# ============================================================
#  ROUTE 4 : DELETE  "/patients/<id>"
#  Deletes a specific patient record by its MongoDB ObjectId.
# ============================================================

@app.route("/patients/<patient_id>", methods=["DELETE"])
def delete_patient(patient_id):
    """Delete a patient record from the database."""
    if patients_collection is None:
        return jsonify({"error": "Database not connected"}), 500
        
    try:
        # Safely convert to ObjectId
        obj_id = ObjectId(patient_id)
    except Exception:
        return jsonify({"error": "Invalid patient ID format"}), 400
        
    try:
        result = patients_collection.delete_one({"_id": obj_id})
        if result.deleted_count == 1:
            return jsonify({"success": True}), 200
        else:
            return jsonify({"error": "Patient not found"}), 404
            
    except Exception as e:
        return jsonify({"error": f"Failed to delete record: {e}"}), 500


# ============================================================
#  START THE APP
# ============================================================

if __name__ == "__main__":
    # debug=True  --> auto-reloads on code changes, shows errors
    # Set debug=False before deploying to production
    app.run(debug=True)
