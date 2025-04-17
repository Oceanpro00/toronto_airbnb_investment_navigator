# model_utils.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor

def load_and_train_model():
    df = pd.read_csv("data/listings_feature_matrix.csv")

    df['price_per_person'] = df['price'] / df['accommodates'].replace(0, np.nan)
    df['bed_bath_interaction'] = df['bedrooms'] * df['bathrooms_count']
    df['log_beds'] = np.log1p(df['beds'])
    df['log_reviews_ly'] = np.log1p(df['number_of_reviews_ly'])

    amenity_cols = [col for col in df.columns if col.startswith('amenities_')]
    df['amenity_count'] = df[amenity_cols].sum(axis=1)
    amenity_means = df[amenity_cols].mean()
    common_amenities = amenity_means[amenity_means > 0.02].index.tolist()

    base_features = [
        'accommodates', 'bedrooms', 'beds', 'bathrooms_count',
        'log_beds', 'log_reviews_ly', 'price_per_person',
        'bed_bath_interaction', 'amenity_count'
    ]
    neighborhood_cols = [col for col in df.columns if col.startswith('neighbourhood_')]
    property_type_cols = [col for col in df.columns if col.startswith('standardized_property_type')]
    stay_duration_cols = ['stay_duration_Long-term', 'stay_duration_Mid-term', 'stay_duration_Short-term']

    features = base_features + common_amenities + neighborhood_cols + property_type_cols + stay_duration_cols
    X = df[features]
    y = np.log1p(df['price'])

    model = RandomForestRegressor(n_estimators=500, random_state=42)
    model.fit(X, y)

    return model, features, common_amenities

def prepare_input(data, features, common_amenities):
    df_input = pd.DataFrame([data])

    df_input['price_per_person'] = df_input['price'] / df_input['accommodates']
    df_input['bed_bath_interaction'] = df_input['bedrooms'] * df_input['bathrooms_count']
    df_input['log_beds'] = np.log1p(df_input['beds'])
    df_input['log_reviews_ly'] = np.log1p(df_input['number_of_reviews_ly'])

    for amenity in common_amenities:
        df_input[amenity] = 1 if amenity in data.get('amenities', []) else 0

    for col in features:
        if col not in df_input:
            df_input[col] = 0

    return df_input[features]
