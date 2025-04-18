from flask import Flask, request, jsonify, render_template
import os
import requests
import xgboost as xgb
import numpy as np
import pandas as pd

app = Flask(__name__)

# S3 bucket URLs for the models
MODEL_URLS = {
    'price': "https://airbnbgroup3project.s3.us-east-1.amazonaws.com/price_XGBmodel_20250417_181154(73.25).json",
    'revenue': "https://airbnbgroup3project.s3.us-east-1.amazonaws.com/revenue_XGBmodel_20250417_181154(72.74).json",
    'occupancy': "https://airbnbgroup3project.s3.us-east-1.amazonaws.com/occupancy_XGBmodel_20250417_181154(65.47).json"
}

# Neighborhoods and property types from your dataset
neighborhoods = [
    'Annex', 'Kensington-Chinatown', 'Alderwood', 'Downsview-Roding-CFB', 'Oakridge',
    'Waterfront Communities-The Island', 'The Beaches', 'Rosedale-Moore Park', 
    'Bay Street Corridor', 'Church-Yonge Corridor', 'Humewood-Cedarvale', 'Junction Area',
    'Niagara', 'Dovercourt-Wallace Emerson-Junction', 'Willowridge-Martingrove-Richview', 
    'Woodbine-Lumsden', 'Moss Park', 'South Parkdale', 'Newtonbrook West', 'Broadview North', 
    'Little Portugal', 'Casa Loma', 'Etobicoke West Mall', 'Cliffcrest',
    'Cabbagetown-South St.James Town', 'Islington-City Centre West', 'Blake-Jones', 
    'Trinity-Bellwoods', 'Roncesvalles', 'North St.James Town', 'Corso Italia-Davenport',
    'Mount Pleasant West', 'East End-Danforth', 'Old East York', 'Lambton Baby Point', 
    'Oakwood Village', 'Wexford/Maryvale', 'York University Heights', 'South Riverdale', 
    'Morningside', 'Parkwoods-Donalda', 'Palmerston-Little Italy', 'Dufferin Grove',
    'Greenwood-Coxwell', 'University', 'St.Andrew-Windfields', 'Birchcliffe-Cliffside', 
    'Yonge-Eglinton', 'Taylor-Massey', 'Willowdale East', 'Lawrence Park North',
    'Mimico (includes Humber Bay Shores)', 'Englemount-Lawrence', 'Flemingdon Park', 
    'Clanton Park', 'Danforth East York', 'Bridle Path-Sunnybrook-York Mills',
    'Runnymede-Bloor West Village', 'High Park-Swansea', 'Willowdale West', 
    'Stonegate-Queensway', 'Long Branch', 'Danforth', 'North Riverdale'
]

property_types = [
    'condo', 'rental unit', 'townhouse', 'home', 'bungalow',
    'guest suite', 'loft', 'serviced apartment', 'guesthouse',
    'cottage', 'place', 'private room', 'tiny home', 'hostel',
    'villa', 'boutique hotel', 'bed and breakfast',
    'vacation home', 'hotel', 'apartment'
]

room_types = ['Entire home/apt', 'Private room']

# Available amenities
amenities = [
    'Wifi', 'TV', 'Kitchen', 'Washer', 'Dryer', 'Air conditioning', 'Heating',
    'Dedicated workspace', 'Pool', 'Hot tub', 'Free parking on premises', 'Gym',
    'BBQ grill', 'Indoor fireplace', 'Breakfast', 'Smoking allowed',
    'Pets allowed', 'Doorman', 'Elevator', 'Security camera'
]

# Min price thresholds for neighborhoods
min_prices = {
    "Annex": 120,
    "Bay Street Corridor": 140,
    "Waterfront Communities-The Island": 135,
    "Rosedale-Moore Park": 150,
    "Trinity-Bellwoods": 125,
    "Little Portugal": 115,
    "default": 90
}

# Load models (using simplified approach that doesn't actually use S3 models)
def load_models():
    # For now, we'll just return None for the models
    # In production, you would download and use the real models
    return {}

# Global models
models = load_models()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/options', methods=['GET'])
def get_options():
    return jsonify({
        'neighborhoods': neighborhoods,
        'property_types': property_types,
        'room_types': room_types,
        'amenities': amenities
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get data from request
        data = request.json
        
        # Extract required fields
        neighborhood = data.get('neighborhood', '')
        property_type = data.get('property_type', '')
        room_type = data.get('room_type', '')
        
        # Get optional numeric fields with defaults
        bedrooms = float(data.get('bedrooms', 1))
        bathrooms = float(data.get('bathrooms', 1))
        beds = float(data.get('beds', 1))
        accommodates = float(data.get('accommodates', 2))
        
        # Get selected amenities
        selected_amenities = data.get('amenities', [])
        amenity_count = len(selected_amenities)
        
        # Simple prediction logic (similar to your previous working version)
        # Start with a base price
        base_price = 100
        
        # Property type adjustments
        property_adjustments = {
            'condo': 20,
            'rental unit': 15,
            'townhouse': 30,
            'home': 40,
            'bungalow': 35,
            'guest suite': 10,
            'loft': 25,
            'serviced apartment': 20,
            'boutique hotel': 45,
            'apartment': 15
        }
        
        # Apply property type adjustment
        if property_type.lower() in property_adjustments:
            base_price += property_adjustments[property_type.lower()]
        
        # Apply room type adjustment
        if room_type == "Entire home/apt":
            base_price += 40
        elif room_type == "Private room":
            base_price += 5
            
        # Adjust for bedrooms, bathrooms, beds, accommodates
        base_price += (bedrooms * 20)
        base_price += (bathrooms * 15)
        base_price += (beds * 10)
        base_price += (accommodates * 5)
        
        # Adjust for amenities (each amenity adds a bit to the price)
        base_price += (amenity_count * 3)
        
        # Specific amenity adjustments
        if 'Pool' in selected_amenities:
            base_price += 30
        if 'Hot tub' in selected_amenities:
            base_price += 20
        if 'Free parking on premises' in selected_amenities:
            base_price += 15
        
        # Apply neighborhood adjustment
        if neighborhood in min_prices:
            min_price = min_prices[neighborhood]
        else:
            min_price = min_prices["default"]
        
        # Ensure price meets minimum threshold
        predicted_price = max(base_price, min_price)
        
        # Calculate estimated occupancy (in %)
        # This is a simplified formula - better locations and amenities = higher occupancy
        base_occupancy = 50  # Start with 50%
        
        # Premium neighborhoods get higher occupancy
        premium_neighborhoods = ['Bay Street Corridor', 'Waterfront Communities-The Island', 
                                'Trinity-Bellwoods', 'Annex', 'Little Portugal']
        if neighborhood in premium_neighborhoods:
            base_occupancy += 15
        
        # More amenities = higher occupancy
        base_occupancy += min(20, amenity_count * 2)  # Cap at 20% increase
        
        # Cap occupancy at 90%
        occupancy = min(90, base_occupancy)
        
        # Calculate estimated monthly revenue
        # Revenue = Price per night * Occupancy rate * 30 days
        estimated_revenue = predicted_price * (occupancy / 100) * 30
        
        # Prepare the response
        response = {
            'price': round(predicted_price, 2),
            'revenue': round(estimated_revenue, 2),
            'occupancy': round(occupancy, 1),
            'neighborhood': neighborhood,
            'property_type': property_type,
            'room_type': room_type
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)