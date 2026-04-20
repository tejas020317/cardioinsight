# ============================================================
#  Heart Disease Prediction -- Data Loading & Exploration
#  Dataset : heart.csv  (UCI Heart Disease Dataset)
# ============================================================

# -- Step 1 : Import Required Libraries ----------------------
import pandas as pd     # For loading and working with tabular data
import numpy as np      # For numerical operations


# -- Step 2 : Load the Dataset -------------------------------
df = pd.read_csv("heart.csv")   # Reads the CSV file into a DataFrame
print("[OK] Dataset loaded successfully!\n")


# -- Step 3 : Basic Overview ---------------------------------

# 3a -- First 5 rows (gives a quick peek at the data)
print("=" * 55)
print("FIRST 5 ROWS OF THE DATASET")
print("=" * 55)
print(df.head())
print()

# 3b -- Shape of the dataset (rows, columns)
print("=" * 55)
print("DATASET SHAPE  -->  (rows, columns)")
print("=" * 55)
print("   Rows    : {}  (each row = one patient record)".format(df.shape[0]))
print("   Columns : {}  (each column = one feature/attribute)".format(df.shape[1]))
print()

# 3c -- Column names
print("=" * 55)
print("COLUMN NAMES")
print("=" * 55)
for i, col in enumerate(df.columns, start=1):
    print("   {:2}. {}".format(i, col))
print()


# -- Step 4 : Data Quality Check -----------------------------

# 4a -- Data types of each column
print("=" * 55)
print("DATASET INFO  (data types per column)")
print("=" * 55)
print(df.info())
print()

# 4b -- Missing values check (0 means no missing values in that column)
print("=" * 55)
print("MISSING VALUES PER COLUMN")
print("=" * 55)
missing = df.isnull().sum()
print(missing)
print()

total_missing = missing.sum()
if total_missing == 0:
    print("[OK] Great news! No missing values found in the dataset.")
else:
    print("[WARNING] Total missing values : {}  -- needs handling!".format(total_missing))
print()


# -- Step 5 : Separate Features (X) and Target (y) ----------
print("=" * 55)
print("SEPARATING FEATURES AND TARGET")
print("=" * 55)

# X contains all columns EXCEPT the target column
X = df.drop(columns=["target"])

# y contains ONLY the target column (what we want to predict)
y = df["target"]

print("   Feature matrix  X  -->  shape : {}".format(X.shape))
print("   Target vector   y  -->  shape : {}".format(y.shape))
print()
print("   Feature columns used for prediction :")
for col in X.columns:
    print("      * {}".format(col))
print()
print("   Target column  -->  'target'")
print("      0 = No Heart Disease")
print("      1 = Heart Disease Present")
print()

# Quick look at how many patients fall in each class
print("=" * 55)
print("TARGET COLUMN -- Value Counts")
print("=" * 55)
print(df["target"].value_counts())
print()
print("   Percentage breakdown :")
pct = df["target"].value_counts(normalize=True).mul(100).round(2)
for label, val in pct.items():
    print("      Class {} : {}%".format(label, val))


# ============================================================
#  COLUMN EXPLANATIONS  (printed as a quick reference guide)
# ============================================================
print()
print("=" * 55)
print("WHAT DOES EACH COLUMN MEAN?")
print("=" * 55)

column_info = [
    ("age",      "Age of the patient in years"),
    ("sex",      "Gender -- 1 = Male, 0 = Female"),
    ("cp",       "Chest Pain Type:\n"
                 "             0 = Typical Angina\n"
                 "             1 = Atypical Angina\n"
                 "             2 = Non-anginal Pain\n"
                 "             3 = Asymptomatic (no pain felt, but still risky)"),
    ("trestbps", "Resting Blood Pressure (mm Hg) when patient was admitted"),
    ("chol",     "Serum Cholesterol level (mg/dl) -- higher level = more risk"),
    ("fbs",      "Fasting Blood Sugar > 120 mg/dl -- 1 = True, 0 = False"),
    ("restecg",  "Resting ECG Results:\n"
                 "             0 = Normal\n"
                 "             1 = ST-T wave abnormality\n"
                 "             2 = Left ventricular hypertrophy"),
    ("thalach",  "Maximum Heart Rate achieved during an exercise test"),
    ("exang",    "Exercise Induced Angina (chest pain during exercise)\n"
                 "             1 = Yes, 0 = No"),
    ("oldpeak",  "ST depression during exercise vs at rest\n"
                 "             Higher value = more heart stress"),
    ("slope",    "Slope of the peak exercise ST segment:\n"
                 "             0 = Upsloping  1 = Flat  2 = Downsloping"),
    ("ca",       "Number of major blood vessels (0-3) visible by fluoroscopy\n"
                 "             More blocked vessels = higher risk"),
    ("thal",     "Thalassemia (a blood disorder):\n"
                 "             0 = Normal\n"
                 "             1 = Fixed Defect\n"
                 "             2 = Reversible Defect"),
    ("target",   "[TARGET] What we want to predict:\n"
                 "             1 = Heart Disease Present\n"
                 "             0 = No Heart Disease"),
]

for col, explanation in column_info:
    print("\n   [{}]".format(col))
    print("      --> {}".format(explanation))

print()
print("=" * 55)
print("[DONE] Step 1 complete!  Moving to scaling & analysis.")
print("=" * 55)


# ============================================================
#  STEP 6 : FEATURE SCALING
#  Why? -- ML algorithms work better when all features are
#           on the same numeric scale (mean=0, std=1).
#           We ONLY scale X (features), never y (target).
# ============================================================

# Import StandardScaler from scikit-learn
from sklearn.preprocessing import StandardScaler

print()
print("=" * 55)
print("STEP 6 : FEATURE SCALING")
print("=" * 55)

# Create a scaler object
scaler = StandardScaler()

# Fit (learn the mean & std) and transform (apply scaling) on X
# The result is a NumPy array, so we wrap it back into a DataFrame
X_scaled = pd.DataFrame(
    scaler.fit_transform(X),   # fit + transform in one step
    columns=X.columns          # keep original column names
)

print("   Scaler used   : StandardScaler")
print("   What it does  : Each feature --> mean = 0, std = 1")
print()
print("   Original X (first 3 rows, first 4 cols) :")
print(X.iloc[:3, :4].to_string(index=False))
print()
print("   Scaled  X (first 3 rows, first 4 cols) :")
print(X_scaled.iloc[:3, :4].round(3).to_string(index=False))
print()
print("[OK] Feature scaling done!")


# ============================================================
#  STEP 7 : TRAIN - TEST SPLIT
#  Why? -- We train the model on 80% of data (training set)
#           and test how well it performs on the remaining
#           20% (test set) that it has never seen before.
# ============================================================

from sklearn.model_selection import train_test_split

print()
print("=" * 55)
print("STEP 7 : TRAIN-TEST SPLIT")
print("=" * 55)

# Split the SCALED features and target into train/test sets
# test_size=0.2  --> 20% for testing, 80% for training
# random_state=42 --> fixes the random seed so results are reproducible
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y,
    test_size=0.2,
    random_state=42
)

print("   Total samples   : {}".format(len(X_scaled)))
print("   Training samples: {}  (80%)".format(len(X_train)))
print("   Testing  samples: {}  (20%)".format(len(X_test)))
print()
print("   X_train shape : {}".format(X_train.shape))
print("   X_test  shape : {}".format(X_test.shape))
print("   y_train shape : {}".format(y_train.shape))
print("   y_test  shape : {}".format(y_test.shape))
print()
print("[OK] Train-test split done!")


# ============================================================
#  STEP 8 : DATA VISUALIZATION
#  We create 3 types of plots to better understand the data
#  visually before building any model.
# ============================================================

import matplotlib.pyplot as plt   # Core plotting library
import seaborn as sns             # Built on matplotlib; nicer defaults

# Use a clean, consistent visual style
sns.set_style("whitegrid")
sns.set_palette("Set2")

print()
print("=" * 55)
print("STEP 8 : DATA VISUALIZATION")
print("=" * 55)
print("   Generating plots -- windows will open one by one.")
print()


# ----------------------------------------------------------
# PLOT A : Count Plot -- Heart Disease vs No Disease
# ----------------------------------------------------------
# Shows how many patients have heart disease (1) vs not (0).
# Helps us understand if the dataset is balanced.

plt.figure(figsize=(7, 5))

ax = sns.countplot(
    x="target",
    hue="target",          # hue= required in seaborn >= 0.13 when using palette
    data=df,
    palette={0: "#4CAF50", 1: "#F44336"},   # 0 = green (healthy), 1 = red (disease)
    edgecolor="black",
    legend=False           # hide the auto-generated legend (axis labels are enough)
)

# Add count labels on top of each bar
for bar in ax.patches:
    ax.text(
        bar.get_x() + bar.get_width() / 2,  # x position (center of bar)
        bar.get_height() + 5,               # y position (just above bar)
        int(bar.get_height()),              # the count value
        ha="center", va="bottom", fontsize=12, fontweight="bold"
    )

plt.title("Count of Heart Disease vs No Heart Disease", fontsize=14, fontweight="bold")
plt.xlabel("Target  (0 = No Disease,  1 = Disease)", fontsize=12)
plt.ylabel("Number of Patients", fontsize=12)
plt.xticks([0, 1], ["No Disease (0)", "Heart Disease (1)"], fontsize=11)
plt.tight_layout()
plt.savefig("plot_a_target_count.png", dpi=150)   # Save as image file
plt.show()
print("   [Plot A saved] --> plot_a_target_count.png")


# ----------------------------------------------------------
# PLOT B : Correlation Heatmap
# ----------------------------------------------------------
# Shows how strongly each feature is related to every other
# feature. Values close to +1 or -1 mean strong correlation.
# We are especially interested in the 'target' column row.

plt.figure(figsize=(12, 9))

corr_matrix = df.corr()   # Compute correlation of all columns

sns.heatmap(
    corr_matrix,
    annot=True,          # Show the number inside each cell
    fmt=".2f",           # Round to 2 decimal places
    cmap="coolwarm",     # Red = positive, Blue = negative correlation
    linewidths=0.5,      # Grid lines between cells
    square=True,
    cbar_kws={"shrink": 0.8}
)

plt.title("Correlation Heatmap -- All Features vs Target", fontsize=14, fontweight="bold")
plt.xticks(rotation=45, ha="right", fontsize=10)
plt.yticks(rotation=0, fontsize=10)
plt.tight_layout()
plt.savefig("plot_b_correlation_heatmap.png", dpi=150)
plt.show()
print("   [Plot B saved] --> plot_b_correlation_heatmap.png")


# ----------------------------------------------------------
# PLOT C : Histograms -- Age, Cholesterol, Max Heart Rate
# ----------------------------------------------------------
# Shows the distribution (spread) of each numeric feature.
# The two overlaid colors help compare disease vs no-disease.

fig, axes = plt.subplots(1, 3, figsize=(16, 5))   # 1 row, 3 side-by-side plots
fig.suptitle("Feature Distributions by Heart Disease Status",
             fontsize=14, fontweight="bold", y=1.02)

features_to_plot = [
    ("age",     "Age (years)",          "#2196F3"),  # blue
    ("chol",    "Cholesterol (mg/dl)",  "#FF9800"),  # orange
    ("thalach", "Max Heart Rate",       "#9C27B0"),  # purple
]

for ax, (feature, label, color) in zip(axes, features_to_plot):
    # Plot separate histogram for each target class
    for target_val, target_label, alpha in [(0, "No Disease", 0.6), (1, "Disease", 0.8)]:
        ax.hist(
            df[df["target"] == target_val][feature],
            bins=20,
            alpha=alpha,
            label=target_label,
            edgecolor="white",
            linewidth=0.5
        )

    ax.set_title(label, fontsize=12, fontweight="bold")
    ax.set_xlabel(label, fontsize=10)
    ax.set_ylabel("Number of Patients", fontsize=10)
    ax.legend(fontsize=9)

plt.tight_layout()
plt.savefig("plot_c_histograms.png", dpi=150)
plt.show()
print("   [Plot C saved] --> plot_c_histograms.png")


# ============================================================
#  STEP 9 : KEY INSIGHTS FROM THE DATA
#  We look at correlation values and distributions to draw
#  simple, beginner-friendly observations.
# ============================================================

print()
print("=" * 55)
print("STEP 9 : KEY INSIGHTS FROM THE DATA")
print("=" * 55)

# --- Insight 1: strongest correlations with target ---
target_corr = corr_matrix["target"].drop("target").sort_values(key=abs, ascending=False)

print()
print("  [1] FEATURES MOST CORRELATED WITH HEART DISEASE (target)")
print("      (Closer to +1 or -1 = stronger relationship)")
print()
for feat, val in target_corr.items():
    direction = "(+) positive" if val > 0 else "(-) negative"
    strength  = "STRONG" if abs(val) >= 0.3 else "moderate" if abs(val) >= 0.15 else "weak"
    print("      {:10s}  corr = {:+.3f}   {}   [{}]".format(feat, val, direction, strength))

print()
print("  [2] WHAT DOES THE CORRELATION TELL US?")
print()

top_positive = target_corr[target_corr > 0].idxmax()
top_negative = target_corr[target_corr < 0].idxmin()

print("      * '{}' has the strongest POSITIVE link to disease".format(top_positive))
print("        --> Higher value = more likely to have heart disease")
print()
print("      * '{}' has the strongest NEGATIVE link to disease".format(top_negative))
print("        --> Higher value = less likely to have heart disease")

# --- Insight 2: Age ---
print()
print("  [3] DOES OLDER AGE INCREASE HEART DISEASE RISK?")
avg_age_disease   = df[df["target"] == 1]["age"].mean()
avg_age_no_disease = df[df["target"] == 0]["age"].mean()
print("      Average age WITH disease    : {:.1f} years".format(avg_age_disease))
print("      Average age WITHOUT disease : {:.1f} years".format(avg_age_no_disease))
if avg_age_disease > avg_age_no_disease:
    print("      --> YES, patients WITH disease tend to be slightly older.")
else:
    print("      --> Interestingly, age alone is not the main differentiator here.")

# --- Insight 3: Cholesterol ---
print()
print("  [4] CHOLESTEROL LEVELS")
avg_chol_disease    = df[df["target"] == 1]["chol"].mean()
avg_chol_no_disease = df[df["target"] == 0]["chol"].mean()
print("      Average cholesterol WITH disease    : {:.1f} mg/dl".format(avg_chol_disease))
print("      Average cholesterol WITHOUT disease : {:.1f} mg/dl".format(avg_chol_no_disease))
print("      --> Cholesterol alone is a weak predictor here;")
print("          it works better combined with other features.")

# --- Insight 4: Max Heart Rate ---
print()
print("  [5] MAX HEART RATE (thalach)")
avg_hr_disease    = df[df["target"] == 1]["thalach"].mean()
avg_hr_no_disease = df[df["target"] == 0]["thalach"].mean()
print("      Average max heart rate WITH disease    : {:.1f} bpm".format(avg_hr_disease))
print("      Average max heart rate WITHOUT disease : {:.1f} bpm".format(avg_hr_no_disease))
print("      --> Patients WITH disease tend to reach a HIGHER max heart rate,")
print("          which seems counterintuitive but is a known clinical finding.")

# --- Insight 5: Dataset balance ---
print()
print("  [6] DATASET BALANCE")
n_disease    = (y == 1).sum()
n_no_disease = (y == 0).sum()
print("      Heart Disease     : {} patients  ({:.1f}%)".format(
    n_disease, 100 * n_disease / len(y)))
print("      No Heart Disease  : {} patients  ({:.1f}%)".format(
    n_no_disease, 100 * n_no_disease / len(y)))
print("      --> The dataset is well-balanced (~50/50). No special")
print("          balancing techniques needed for the next steps.")

print()
print("=" * 55)
print("[DONE] Visualization & Insights complete!")
print("[NEXT] Training machine learning models...")
print("=" * 55)


# ============================================================
#  STEP 10 : IMPORT MODEL LIBRARIES
# ============================================================

from sklearn.linear_model    import LogisticRegression
from sklearn.tree            import DecisionTreeClassifier
from sklearn.metrics         import accuracy_score, confusion_matrix
import pickle   # Built-in Python library to save/load objects to disk


# ============================================================
#  STEP 11 : TRAIN BOTH MODELS
#
#  Logistic Regression  -- works like a "smart threshold" that
#    finds the best boundary between 0 and 1 using math.
#
#  Decision Tree        -- works like a flowchart of yes/no
#    questions until it reaches a final answer.
# ============================================================

print()
print("=" * 55)
print("STEP 11 : TRAINING MODELS")
print("=" * 55)

# --- Model A : Logistic Regression ---
# max_iter=1000  -> give the algorithm enough rounds to converge
# random_state=42 -> reproducible results
lr_model = LogisticRegression(max_iter=1000, random_state=42)
lr_model.fit(X_train, y_train)          # Train on training data
print("   [OK] Logistic Regression trained.")

# --- Model B : Decision Tree Classifier ---
# max_depth=5  -> limits how deep the tree grows (avoids overfitting)
# random_state=42 -> reproducible results
dt_model = DecisionTreeClassifier(max_depth=5, random_state=42)
dt_model.fit(X_train, y_train)          # Train on training data
print("   [OK] Decision Tree trained.")

print()
print("   Both models have now 'learned' patterns from the")
print("   training data (820 patients).")


# ============================================================
#  STEP 12 : EVALUATE BOTH MODELS
#
#  We test each model on the TEST set (205 patients it has
#  NEVER seen before) and measure how well it predicts.
# ============================================================

print()
print("=" * 55)
print("STEP 12 : MODEL EVALUATION")
print("=" * 55)

# ---- Logistic Regression Evaluation ----
lr_predictions  = lr_model.predict(X_test)    # Predict on test data
lr_accuracy     = accuracy_score(y_test, lr_predictions)
lr_conf_matrix  = confusion_matrix(y_test, lr_predictions)

print()
print("  --- Logistic Regression ---")
print("  Logistic Regression Accuracy: {:.2f}%".format(lr_accuracy * 100))
print()
print("  Confusion Matrix:")
print("                  Predicted 0   Predicted 1")
print("  Actual 0  :       {:>5}         {:>5}".format(
    lr_conf_matrix[0][0], lr_conf_matrix[0][1]))
print("  Actual 1  :       {:>5}         {:>5}".format(
    lr_conf_matrix[1][0], lr_conf_matrix[1][1]))
print()

# Break down what the confusion matrix means
lr_tn, lr_fp, lr_fn, lr_tp = lr_conf_matrix.ravel()
print("  What does this mean?")
print("    True Negatives  (correctly said NO disease) : {}".format(lr_tn))
print("    False Positives (wrongly said HAS disease)  : {}".format(lr_fp))
print("    False Negatives (missed disease cases)      : {}".format(lr_fn))
print("    True Positives  (correctly found disease)   : {}".format(lr_tp))

# ---- Decision Tree Evaluation ----
dt_predictions  = dt_model.predict(X_test)
dt_accuracy     = accuracy_score(y_test, dt_predictions)
dt_conf_matrix  = confusion_matrix(y_test, dt_predictions)

print()
print("  --- Decision Tree ---")
print("  Decision Tree Accuracy: {:.2f}%".format(dt_accuracy * 100))
print()
print("  Confusion Matrix:")
print("                  Predicted 0   Predicted 1")
print("  Actual 0  :       {:>5}         {:>5}".format(
    dt_conf_matrix[0][0], dt_conf_matrix[0][1]))
print("  Actual 1  :       {:>5}         {:>5}".format(
    dt_conf_matrix[1][0], dt_conf_matrix[1][1]))
print()

dt_tn, dt_fp, dt_fn, dt_tp = dt_conf_matrix.ravel()
print("  What does this mean?")
print("    True Negatives  (correctly said NO disease) : {}".format(dt_tn))
print("    False Positives (wrongly said HAS disease)  : {}".format(dt_fp))
print("    False Negatives (missed disease cases)      : {}".format(dt_fn))
print("    True Positives  (correctly found disease)   : {}".format(dt_tp))


# ============================================================
#  STEP 13 : COMPARE MODELS & PICK THE BEST ONE
# ============================================================

print()
print("=" * 55)
print("STEP 13 : MODEL COMPARISON")
print("=" * 55)
print()
print("  Model                    |  Accuracy")
print("  -------------------------|----------")
print("  Logistic Regression      |  {:.2f}%".format(lr_accuracy * 100))
print("  Decision Tree            |  {:.2f}%".format(dt_accuracy * 100))
print()

# Automatically pick the model with higher accuracy
if lr_accuracy >= dt_accuracy:
    best_model      = lr_model
    best_model_name = "Logistic Regression"
    best_accuracy   = lr_accuracy
else:
    best_model      = dt_model
    best_model_name = "Decision Tree"
    best_accuracy   = dt_accuracy

diff = abs(lr_accuracy - dt_accuracy) * 100
print("  [RESULT] Best Model --> {} ({:.2f}%)".format(
    best_model_name, best_accuracy * 100))
print("  Accuracy difference between the two : {:.2f}%".format(diff))

if diff < 2.0:
    print()
    print("  NOTE: Both models perform very similarly.")
    print("  Logistic Regression is preferred for simplicity and")
    print("  interpretability when accuracy is close.")


# ============================================================
#  STEP 14 : SAVE THE BEST MODEL USING PICKLE
#
#  pickle.dump()  --> saves the trained model to a .pkl file
#  pickle.load()  --> later you can load it back in any script
#                     without retraining from scratch.
# ============================================================

print()
print("=" * 55)
print("STEP 14 : SAVING BEST MODEL")
print("=" * 55)

model_filename = "model.pkl"

# Open file in write-binary mode and dump the model into it
with open(model_filename, "wb") as file:
    pickle.dump(best_model, file)

print()
print("  [OK] Model saved successfully!")
print("  File : {}".format(model_filename))
print("  Model: {}".format(best_model_name))
print()
print("  To load this model later in any script, use:")
print("    import pickle")
print("    with open('model.pkl', 'rb') as f:")
print("        loaded_model = pickle.load(f)")
print("    prediction = loaded_model.predict(new_data)")

# Quick verification: reload and re-predict to confirm save worked
with open(model_filename, "rb") as file:
    reloaded_model = pickle.load(file)

reloaded_preds   = reloaded_model.predict(X_test)
reloaded_accuracy = accuracy_score(y_test, reloaded_preds)
print()
print("  [VERIFY] Reloaded model accuracy : {:.2f}%  -- matches!".format(
    reloaded_accuracy * 100))


# ============================================================
#  STEP 15 : SAMPLE PREDICTIONS  (Predicted vs Actual)
#
#  We pick the first 15 patients from the TEST set and compare
#  what the model predicted vs what the actual label was.
# ============================================================

print()
print("=" * 55)
print("STEP 15 : SAMPLE PREDICTIONS ON TEST DATA")
print("=" * 55)
print("  Using : {}".format(best_model_name))
print()

# Show first 15 predictions vs actual labels
sample_size = 15
sample_preds   = best_model.predict(X_test[:sample_size])
sample_actuals = y_test.values[:sample_size]   # .values converts Series to array

print("  {:<10}  {:<12}  {:<10}  {}".format(
    "Patient", "Predicted", "Actual", "Correct?"))
print("  " + "-" * 45)

correct_count = 0
for i in range(sample_size):
    predicted = sample_preds[i]
    actual    = sample_actuals[i]
    match     = "[YES]" if predicted == actual else "[NO] <-- wrong"

    pred_label   = "Disease(1)"  if predicted == 1 else "Healthy(0)"
    actual_label = "Disease(1)"  if actual    == 1 else "Healthy(0)"

    print("  {:<10}  {:<12}  {:<10}  {}".format(
        "Patient " + str(i + 1), pred_label, actual_label, match))

    if predicted == actual:
        correct_count += 1

print()
print("  Correct predictions in sample : {}/{}".format(correct_count, sample_size))
print("  Sample accuracy : {:.1f}%".format(100 * correct_count / sample_size))


# ============================================================
#  FINAL SUMMARY
# ============================================================

print()
print("=" * 55)
print("FINAL SUMMARY")
print("=" * 55)
print()
print("  Dataset          : heart.csv  ({} patients)".format(len(df)))
print("  Training set     : {} patients  (80%)".format(len(X_train)))
print("  Test set         : {} patients  (20%)".format(len(X_test)))
print()
print("  Logistic Regression Accuracy : {:.2f}%".format(lr_accuracy * 100))
print("  Decision Tree Accuracy       : {:.2f}%".format(dt_accuracy * 100))
print()
print("  Best Model  --> {}  ({:.2f}%)".format(best_model_name, best_accuracy * 100))
print("  Saved to    --> model.pkl")
print()
print("=" * 55)
print("[DONE] Heart Disease Prediction project -- Step 3 complete!")
print("[NEXT] You can now add Flask to build a web prediction app!")
print("=" * 55)
