# app.py
from flask import Flask, render_template, request
from model_utils import load_and_train_model, prepare_input
import numpy as np

app = Flask(__name__)
model, features, common_amenities = load_and_train_model()

@app.route('/')
def home():
    return render_template("form.html", common_amenities=common_amenities)

@app.route('/predict', methods=['POST'])
def predict():
    user_input = {
        'accommodates': int(request.form['accommodates']),
        'bedrooms': float(request.form['bedrooms']),
        'beds': float(request.form['beds']),
        'bathrooms_count': float(request.form['bathrooms_count']),
        'number_of_reviews_ly': float(request.form['number_of_reviews_ly']),
        'price': 1.0,  # Placeholder for derived features
        'amenities': request.form.getlist('amenities')
    }

    input_df = prepare_input(user_input, features, common_amenities)
    log_price_pred = model.predict(input_df)[0]
    price_pred = np.expm1(log_price_pred)

    return render_template("form.html", prediction=round(price_pred, 2), common_amenities=common_amenities)

if __name__ == '__main__':
    app.run(debug=True)
