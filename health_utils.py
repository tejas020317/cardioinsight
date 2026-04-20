# ============================================================
#  health_utils.py
#  Heart Disease Prediction Project -- Health Analysis Layer
#
#  This file contains helper functions that:
#    - Calculate BMI, BP category, Heart Rate category
#    - Determine risk level from model output probability
#    - Generate health recommendations
#    - Combine everything into one clean health report
#
#  Usage:
#    from health_utils import generate_health_report
#    report = generate_health_report(user_inputs, loaded_model)
#
#  This module is designed to be imported by:
#    - A test script (like health_demo.py)
#    - A Flask backend (app.py) in the next step
# ============================================================

import numpy as np
import pandas as pd


# ============================================================
#  FUNCTION 1 : CALCULATE BMI
#
#  BMI (Body Mass Index) is a rough measure of body fat
#  based on height and weight.
#
#  Formula : BMI = weight (kg) / height (m)^2
# ============================================================

def calculate_bmi(height_cm, weight_kg):
    """
    Calculate BMI and return the value + category.

    Parameters:
        height_cm (float) : Height in centimetres  e.g. 170
        weight_kg (float) : Weight in kilograms     e.g. 70

    Returns:
        dict with keys: 'bmi' (float), 'category' (str)
    """

    # Step 1: Convert height from cm to metres
    height_m = height_cm / 100.0

    # Step 2: Apply the BMI formula
    bmi = weight_kg / (height_m ** 2)

    # Step 3: Classify into a category
    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25.0:
        category = "Normal"
    elif bmi < 30.0:
        category = "Overweight"
    else:
        category = "Obese"

    return {
        "bmi"     : round(bmi, 2),
        "category": category
    }


# ============================================================
#  FUNCTION 2 : CLASSIFY BLOOD PRESSURE
#
#  Blood pressure (systolic) tells us how hard the heart
#  is pushing blood through the arteries.
# ============================================================

def classify_bp(bp_value):
    """
    Classify resting blood pressure (systolic, mm Hg).

    Parameters:
        bp_value (int/float) : Systolic blood pressure value

    Returns:
        str  --  "Normal", "Elevated", or "High"
    """

    if bp_value < 120:
        return "Normal"
    elif bp_value <= 129:
        return "Elevated"
    else:
        return "High"


# ============================================================
#  FUNCTION 3 : CLASSIFY HEART RATE
#
#  Resting heart rate tells us how efficiently the heart
#  pumps blood. Athletes often have lower resting HR.
# ============================================================

def classify_heart_rate(hr):
    """
    Classify resting heart rate in beats per minute (bpm).

    Parameters:
        hr (int/float) : Heart rate in bpm

    Returns:
        str  --  "Low", "Normal", or "High"
    """

    if hr < 60:
        return "Low"
    elif hr <= 100:
        return "Normal"
    else:
        return "High"


# ============================================================
#  FUNCTION 4 : GET RISK LEVEL FROM MODEL PROBABILITY
#
#  The ML model outputs a probability (0.0 to 1.0) that
#  the patient has heart disease. We convert that into a
#  human-readable risk level.
# ============================================================

def get_risk_level(risk_score):
    """
    Convert a calculated risk score (0-100) into a risk label.

    Parameters:
        risk_score (float) : Value between 0 and 100

    Returns:
        str  --  "Low Risk", "Medium Risk", or "High Risk"
    """

    if risk_score < 40:
        return "Low Risk"
    elif risk_score < 70:
        return "Medium Risk"
    else:
        return "High Risk"


# ============================================================
#  FUNCTION 5 : HEALTH RECOMMENDATION
#
#  Based on the risk level, we return a simple piece of
#  actionable advice for the patient.
# ============================================================

def get_recommendation(risk_level):
    """
    Return a health recommendation based on risk level.

    Parameters:
        risk_level (str) : One of "Low Risk", "Medium Risk", "High Risk"

    Returns:
        str  -- plain-English health advice
    """

    recommendations = {
        "Low Risk"   : (
            "Great news! Maintain your healthy lifestyle. "
            "Keep exercising regularly, eat a balanced diet, "
            "and schedule routine check-ups."
        ),
        "Medium Risk": (
            "You should pay attention to your health. "
            "Improve your diet (reduce salt, sugar, and fried food), "
            "exercise at least 30 minutes a day, and avoid smoking. "
            "See a doctor for a check-up soon."
        ),
        "High Risk"  : (
            "Please consult a doctor as soon as possible. "
            "Closely monitor your blood pressure, cholesterol, and heart rate. "
            "Avoid stress, follow a heart-healthy diet, and take any "
            "prescribed medications regularly."
        ),
    }

    # Handle unexpected values safely
    return recommendations.get(
        risk_level,
        "Please consult a healthcare professional for personalised advice."
    )


# ============================================================
#  FUNCTION 6 : COMBINED HEALTH REPORT
#
#  This is the main function you will call from Flask.
#  It takes the full set of user inputs + the trained model,
#  runs all the helper functions, and returns one dictionary
#  with everything the frontend needs.
#
#  Expected 'inputs' dictionary keys (matching heart.csv cols):
#    age, sex, cp, trestbps, chol, fbs, restecg,
#    thalach, exang, oldpeak, slope, ca, thal,
#    height_cm, weight_kg        <-- extra fields for BMI
# ============================================================

# Column order MUST match the order used during model training
FEATURE_COLUMNS = [
    "age", "sex", "cp", "trestbps", "chol", "fbs",
    "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"
]

def generate_health_report(inputs, model, scaler=None):
    """
    Generate a full health report for a patient.

    Parameters:
        inputs (dict)   : Patient data including all 13 model features
                          plus optional 'height_cm' and 'weight_kg'.
        model           : Trained sklearn model (loaded from model.pkl).
        scaler          : Optional. The StandardScaler used during training.
                          If provided, features will be scaled before prediction.

    Returns:
        dict with all analysis results  (see structure below)
    """

    # ----------------------------------------------------------
    # Step A : Extract the 13 model features in the right order
    # ----------------------------------------------------------
    feature_values = [inputs.get(col, 0) for col in FEATURE_COLUMNS]

    # Build a single-row DataFrame so column names are preserved
    X_input = pd.DataFrame([feature_values], columns=FEATURE_COLUMNS)

    # ----------------------------------------------------------
    # Step B : Scale features if a scaler was provided
    # ----------------------------------------------------------
    if scaler is not None:
        X_input = pd.DataFrame(
            scaler.transform(X_input),
            columns=FEATURE_COLUMNS
        )

    # ----------------------------------------------------------
    # Step C : Get model prediction and probability
    #   predict()       --> 0 or 1
    #   predict_proba() --> [[prob_class0, prob_class1]]
    # ----------------------------------------------------------
    prediction  = model.predict(X_input)[0]            # 0 or 1

    # Not all sklearn models support predict_proba; fall back gracefully
    if hasattr(model, "predict_proba"):
        probability = model.predict_proba(X_input)[0][1]  # probability of class 1
    else:
        probability = float(prediction)                # 0.0 or 1.0 as fallback

    # ----------------------------------------------------------
    # Step D : Run the health helper functions
    # ----------------------------------------------------------

    # BMI (only if height and weight provided)
    height_cm = inputs.get("height_cm", None)
    weight_kg = inputs.get("weight_kg", None)

    if height_cm and weight_kg:
        bmi_result   = calculate_bmi(height_cm, weight_kg)
        bmi_value    = bmi_result["bmi"]
        bmi_category = bmi_result["category"]
    else:
        bmi_value    = None
        bmi_category = "Not provided"

    # Blood pressure category
    bp_status = classify_bp(inputs.get("trestbps", 0))

    # Heart rate category (thalach = max heart rate)
    heart_rate_status = classify_heart_rate(inputs.get("thalach", 0))

    # ----------------------------------------------------------
    # Calculate Realistic Risk Score
    # based on Model Probability (70%) + Health Factors (30%)
    # ----------------------------------------------------------
    health_factor_score = 0
    if bp_status == "High":
        health_factor_score += 15
    
    if heart_rate_status == "High":
        health_factor_score += 10
        
    if bmi_category == "Overweight":
        health_factor_score += 5
    elif bmi_category == "Obese":
        health_factor_score += 10

    # Combine values, cap between 0 and 100, and round
    risk_score = (probability * 70) + health_factor_score
    risk_score = min(max(risk_score, 0), 100)
    risk_score = round(risk_score, 2)

    # Risk level from risk score
    risk_level = get_risk_level(risk_score)

    # Recommendation text
    recommendation = get_recommendation(risk_level)

    # ----------------------------------------------------------
    # Step E : Build and return the final report dictionary
    # ----------------------------------------------------------
    report = {
        "prediction"       : "Yes" if prediction == 1 else "No",
        "risk_score"       : risk_score,
        "risk_level"       : risk_level,
        "bmi"              : bmi_value,
        "bmi_category"     : bmi_category,
        "bp_status"        : bp_status,
        "heart_rate_status": heart_rate_status,
        "recommendation"   : recommendation,
    }

    return report


# ============================================================
#  QUICK SELF-TEST
#  Run this file directly to verify everything works:
#    py health_utils.py
# ============================================================

if __name__ == "__main__":

    import pickle

    print("=" * 60)
    print("health_utils.py -- Self-Test")
    print("=" * 60)

    # --- Test individual functions ---
    print()
    print("-- BMI Tests --")
    for height, weight in [(170, 55), (170, 75), (170, 90), (170, 110)]:
        result = calculate_bmi(height, weight)
        print("  Height: {}cm  Weight: {}kg  -->  BMI: {}  ({})".format(
            height, weight, result["bmi"], result["category"]))

    print()
    print("-- Blood Pressure Tests --")
    for bp in [110, 125, 145]:
        print("  BP: {} mm Hg  -->  {}".format(bp, classify_bp(bp)))

    print()
    print("-- Heart Rate Tests --")
    for hr in [50, 78, 115]:
        print("  HR: {} bpm  -->  {}".format(hr, classify_heart_rate(hr)))

    print()
    print("-- Risk Level Tests --")
    for score in [20, 55, 85]:
        level = get_risk_level(score)
        print("  Score: {}  -->  {}".format(score, level))
        print("  Recommendation: {}".format(get_recommendation(level)))
        print()

    # --- Test full report using the saved model ---
    print()
    print("-- Full Health Report Test (using model.pkl) --")

    try:
        with open("model.pkl", "rb") as f:
            model = pickle.load(f)

        # Also try to load the scaler if saved separately
        # (In our project the scaler is not saved yet, so pass None)
        scaler = None

        # Sample patient data (a 55-year-old male with elevated readings)
        sample_patient = {
            "age"      : 55,
            "sex"      : 1,      # Male
            "cp"       : 3,      # Asymptomatic chest pain (risky)
            "trestbps" : 140,    # Elevated blood pressure
            "chol"     : 260,    # High cholesterol
            "fbs"      : 1,      # High fasting blood sugar
            "restecg"  : 1,      # Some ECG abnormality
            "thalach"  : 150,    # Max heart rate during exercise
            "exang"    : 1,      # Exercise causes chest pain
            "oldpeak"  : 2.5,    # Moderate ST depression
            "slope"    : 1,      # Flat ST slope
            "ca"       : 2,      # 2 blocked vessels
            "thal"     : 2,      # Reversible defect
            # Extra fields for BMI (not in model)
            "height_cm": 175,
            "weight_kg": 85,
        }

        report = generate_health_report(sample_patient, model, scaler)

        print()
        print("  Patient Profile: 55-year-old male, elevated readings")
        print()
        print("  {:<22} : {}".format("Heart Disease Predicted", report["prediction"]))
        print("  {:<22} : {}%".format("Risk Score",             report["risk_score"]))
        print("  {:<22} : {}".format("Risk Level",              report["risk_level"]))
        print("  {:<22} : {} ({})".format("BMI",
            report["bmi"], report["bmi_category"]))
        print("  {:<22} : {}".format("Blood Pressure Status",   report["bp_status"]))
        print("  {:<22} : {}".format("Heart Rate Status",       report["heart_rate_status"]))
        print()
        print("  Recommendation:")
        print("    " + report["recommendation"])

    except FileNotFoundError:
        print("  [SKIP] model.pkl not found. Run heart_analysis.py first.")

    print()
    print("=" * 60)
    print("[OK] health_utils.py loaded and tested successfully!")
    print("[NEXT] This module is ready to be imported by Flask.")
    print("=" * 60)
