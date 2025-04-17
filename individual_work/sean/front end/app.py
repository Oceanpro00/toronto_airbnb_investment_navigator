from flask import Flask, request, jsonify, render_template
import os
import pickle
import xgboost as xgb
import numpy as np

app = Flask(__name__)

# Comprehensive list of neighborhoods from the provided array
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
    'Stonegate-Queensway', 'Long Branch', 'Danforth', 'North Riverdale', 
    'Briar Hill-Belgravia', 'Mount Pleasant East', 'Lansing-Westgate', 
    'Lawrence Park South', 'Regent Park', 'Wychwood', 'Woodbine Corridor', 'Weston',
    "Tam O'Shanter-Sullivan", 'Woburn', 'Playter Estates-Danforth', 'Newtonbrook East', 
    'Beechborough-Greenbrook', 'Guildwood', 'High Park North', 'Rexdale-Kipling', 
    'West Hill', 'Weston-Pellam Park', 'Ionview', 'Don Valley Village',
    'Westminster-Branson', 'Agincourt South-Malvern West', 'Dorset Park', 
    'Keelesdale-Eglinton West', 'Thistletown-Beaumond Heights', "L'Amoreaux", 'Bendale',
    'Bayview Woods-Steeles', 'Victoria Village', 'Highland Creek', 'Scarborough Village', 
    'Leaside-Bennington', 'Clairlea-Birchmount', 'Eringate-Centennial-West Deane', 
    'Hillcrest Village', 'Maple Leaf', 'Steeles', 'Rockcliffe-Smythe', 'New Toronto',
    'Humber Heights-Westmount', 'West Humber-Clairville', 'Kingsview Village-The Westway', 
    'Thorncliffe Park', 'Banbury-Don Mills', 'Bedford Park-Nortown', 'Yorkdale-Glen Park',
    'Bathurst Manor', 'Forest Hill South', 'Milliken', 'Kennedy Park', 'Malvern', 
    'Centennial Scarborough', 'Humbermede', "O'Connor-Parkview", 'Caledonia-Fairbank', 
    'Humber Summit', 'Rouge', 'Pelmo Park-Humberlea', 'Glenfield-Jane Heights',
    'Pleasant View', 'Forest Hill North', 'Bayview Village', 'Eglinton East', 
    'Yonge-St.Clair', 'Agincourt North', 'Markland Wood', 'Black Creek', 
    'Princess-Rosethorn', 'Mount Dennis', 'Brookhaven-Amesbury', 'Kingsway South',
    'Henry Farm', 'Mount Olive-Silverstone-Jamestown', 'Edenbridge-Humber Valley', 
    'Rustic', 'Elms-Old Rexdale'
]

# Comprehensive list of property types from the provided array
property_types = [
    'Condo', 'Rental unit', 'Townhouse', 'Home', 'Bungalow',
    'Guest suite', 'Loft', 'Serviced apartment', 'Guesthouse',
    'Cottage', 'Place', 'Private room', 'Barn', 'Tiny home', 'Hostel',
    'Villa', 'Boutique hotel', 'Island', 'Bed and breakfast',
    'Casa particular', 'Vacation home', 'Hotel', 'Shipping container',
    'Cave', 'Farm stay', 'Aparthotel'
]

# Room types from the provided array
room_types = ['Entire home/apt', 'Private room']

# Categorize neighborhoods by price tier
high_end_neighborhoods = [
    'Rosedale-Moore Park', 'Bridle Path-Sunnybrook-York Mills', 'Lawrence Park South',
    'Forest Hill South', 'Yonge-St.Clair', 'Casa Loma', 'The Beaches',
    'Bay Street Corridor', 'Waterfront Communities-The Island', 'Annex'
]

mid_tier_neighborhoods = [
    'Palmerston-Little Italy', 'Trinity-Bellwoods', 'Little Portugal',
    'Roncesvalles', 'High Park-Swansea', 'Mimico (includes Humber Bay Shores)',
    'Mount Pleasant West', 'Yonge-Eglinton', 'Church-Yonge Corridor',
    'Wychwood', 'Leaside-Bennington', 'North Riverdale', 'South Riverdale'
]

# Create minimum price thresholds for all neighborhoods
min_prices = {}

# Set default minimum price
min_prices["default"] = 80

# Set prices for high-end neighborhoods
for neighborhood in high_end_neighborhoods:
    min_prices[neighborhood] = 120

# Set prices for mid-tier neighborhoods
for neighborhood in mid_tier_neighborhoods:
    min_prices[neighborhood] = 100

# Set prices for all other neighborhoods (keeping the default if not specified)
for neighborhood in neighborhoods:
    if neighborhood not in min_prices:
        min_prices[neighborhood] = 90

# Property type price adjustments
property_price_adjustments = {
    'Condo': 20,
    'Rental unit': 10,
    'Townhouse': 30,
    'Home': 40,
    'Bungalow': 30,
    'Guest suite': 15,
    'Loft': 25,
    'Serviced apartment': 20,
    'Guesthouse': 10,
    'Cottage': 20,
    'Villa': 50,
    'Boutique hotel': 40,
    'Bed and breakfast': 15,
    'Hotel': 30,
    'Vacation home': 35,
    'default': 0
}

# Load model (placeholder function, will be replaced with actual model)
def load_model():
    try:
        # Path to your model files
        model_path = os.path.join(os.path.dirname(__file__), 'model', '../../../results/price_XGBmodel_20250417_181154(73.25).json')
        
        # Load XGBoost model if exists
        if os.path.exists(model_path):
            model = xgb.Booster()
            model.load_model(model_path)
            return model
        else:
            # Return dummy model for development
            return None
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        return None

# Global model instance
model = load_model()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/options', methods=['GET'])
def get_options():
    return jsonify({
        'neighborhoods': neighborhoods,
        'property_types': property_types,
        'room_types': room_types
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
        accommodates = float(data.get('accommodates', 2))
        
        # Simple prediction logic (placeholder)
        # Start with base price from neighborhood
        if neighborhood in min_prices:
            base_price = min_prices[neighborhood]
        else:
            base_price = min_prices["default"]
        
        # Apply property type adjustment
        property_adjustment = property_price_adjustments.get(property_type, property_price_adjustments["default"])
        base_price += property_adjustment
        
        # Apply room type adjustment
        if room_type == "Entire home/apt":
            base_price += 50
        elif room_type == "Private room":
            base_price += 0  # No additional cost for private room
            
        # Adjust for bedrooms, bathrooms, accommodates
        base_price += (bedrooms * 15)
        base_price += (bathrooms * 10)
        base_price += (accommodates * 5)
        
        # Apply additional adjustments for high-end neighborhoods
        if neighborhood in high_end_neighborhoods:
            base_price *= 1.2  # 20% premium
        
        return jsonify({
            'predicted_price': round(base_price, 2),
            'neighborhood': neighborhood,
            'property_type': property_type,
            'room_type': room_type
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)