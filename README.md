# Toronto AirBnB Pricing Assistant & Profit Maximizer (TAPAM)

![Toronto Skyline](https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&q=80&w=1200)

## Table of Contents
- [Project Overview](#project-overview)
- [Team Members](#team-members)
- [Stakeholders](#stakeholders)
- [Data Sources](#data-sources)
- [Machine Learning Approach](#machine-learning-approach)
- [Project Timeline](#project-timeline-14-days)
- [Exploratory Data Analysis Plan](#exploratory-data-analysis-plan)
- [Data Preparation](#data-preparation)
- [Project Structure](#project-structure)
- [Key Deliverables](#key-deliverables)

## Project Overview

The **Toronto AirBnB Pricing Assistant & Profit Maximizer (TAPAM)** is a data-driven tool that helps AirBnB hosts and property investors optimize their rental pricing strategy in Toronto. By analyzing Inside AirBnB data and identifying key amenity value drivers, this tool provides actionable insights on optimal pricing, amenity recommendations, and stay duration strategy for the Toronto short-term rental market.

This project applies machine learning techniques to recommend optimal pricing, identify high-value amenities, and suggest appropriate stay duration strategies for property owners in Toronto's competitive AirBnB market.

## Team Members
- **Sean Schallberger**
- **Bryan Carney**
- **Jitesh Makan**

## Stakeholders

Our tool is designed specifically for:
- **Current AirBnB hosts** looking to optimize pricing and amenities
- **Potential investors** evaluating rental strategies
- **Property owners** considering conversion to AirBnB rentals

Our stakeholders need:
- Data-driven price recommendations
- Understanding of amenity value impact
- Guidance on short-term vs. long-term stay strategy

## Data Sources

Our analysis uses data from:

1. **[Inside AirBnB Toronto](https://insideairbnb.com/get-the-data/)** (March 2, 2025):
   - `listings.csv.gz` - Property details, pricing, and features
   - `calendar.csv.gz` - Availability and booking data
   - `reviews.csv.gz` - Guest feedback and ratings
   - `neighbourhoods.geojson` - Geographic boundaries

## Machine Learning Approach

Our analysis will use a simplified set of models to provide clear pricing insights:

| Host/Investor Need | ML Model | Output |
|---------------|----------|--------|
| Optimize property pricing | **Linear Regression** | Recommended price range |
| Identify high-value amenities | **Feature Importance Analysis** | Amenity value ranking |
| Choose stay duration strategy | **Comparative Analysis** | Short vs. long-term recommendation |

### Model Details 

1. **Linear Regression (Price Prediction)**
   - **Purpose**: Determine optimal pricing for properties
   - **Features**: Property type, location, amenities, accommodations
   - **Output**: Recommended price range

2. **Feature Importance Analysis**
   - **Purpose**: Identify amenities that increase property value
   - **Features**: Binary amenity indicators
   - **Output**: Ranked list of price-boosting amenities

3. **Stay Duration Analysis**
   - **Purpose**: Recommend short vs. long-term stay strategy
   - **Method**: Comparative neighborhood performance analysis
   - **Output**: Stay length recommendation by property type and location

## Project Timeline (14 Days)

### Pre-Project Setup
- Download all datasets from Inside AirBnB Toronto
- Perform initial data exploration and cleaning

### Week 1: Data Engineering & Model Development (7 days)
**Days 1-2: Project Setup & Data Cleaning**
- Create GitHub repository with proper structure
- Standardize property types to 5 key categories
- Extract and categorize amenities
- Handle missing values in essential fields

**Days 3-4: Feature Engineering & Initial Modeling**
- Create binary amenity features
- Implement stay length classification
- Begin developing price prediction model
- Analyze amenity patterns

**Days 5-7: Model Development & Optimization**
- Finalize price prediction model
- Extract amenity importance values
- Develop stay length recommendation logic
- Begin documentation and visualization

### Week 2: Implementation & Presentation (7 days)
**Days 8-9: Analysis & Visualization**
- Create key visualizations
- Implement recommendation function
- Document model performance
- Begin integration of components

**Days 10-12: Testing & Documentation**
- Test with various property scenarios
- Complete GitHub documentation
- Prepare presentation materials
- Create demonstration examples

**Days 13-14: Finalization & Presentation**
- Finalize all components
- Complete presentation slides
- Practice presentation
- Submit final project

## Exploratory Data Analysis Plan

Our focused EDA will examine:

1. **Property Landscape**
   - Most common property types across Toronto
   - Price trends by property type and neighborhood
   - Popular amenities and how often they appear together

2. **Stay Duration Insights**
   - Trends in short-term vs. long-term rentals
   - Neighborhood preferences for stay length
   - Occupancy patterns by rental type

3. **Key Pricing Drivers**
   - Amenities that influence pricing
   - Neighborhood impact on nightly rates
   - How guest capacity affects price

## Data Preparation

### Technical Implementation

1. **Property Type Standardization**:
   - Reduce 50+ property types to 5 clear categories
   - Map all properties to standardized types

2. **Amenity Processing**:
   - Extract amenities from JSON arrays
   - Identify 15-20 most valuable/common amenities
   - Create binary feature matrix

3. **Stay Strategy Classification**:
   - Categorize properties as short or long-term focused
   - Calculate occupancy rates by strategy
   - Identify neighborhood patterns

### Raw Data Handling
Before starting analysis, the compressed data files need to be extracted:

1. Navigate to the `data/raw/` directory
2. Extract the compressed files:
   - `listings.csv.gz` → `listings.csv`
   - `calendar.csv.gz` → `calendar.csv`
   - `reviews.csv.gz` → `reviews.csv`
3. The GeoJSON file (`neighbourhoods.geojson`) can be used directly without extraction

Note: The original compressed files are used due to size constraints. After extraction, ensure your system has sufficient memory to process these large datasets.

## Project Structure

```
toronto_airbnb_pricing_assistant/
│
├── data/
│   ├── raw/                 # Original datasets (compressed)
│   └── processed/           # Cleaned datasets
│
├── notebooks/
│   ├── 1_data_prep.ipynb    # Data cleaning and feature engineering
│   ├── 2_modeling.ipynb     # Price prediction and feature importance
│   ├── 3_analysis.ipynb     # Stay length analysis and recommendations
│   └── 4_demo.ipynb         # User input and recommendation examples
│
├── src/
│   ├── data_prep.py         # Basic data processing functions
│   └── modeling.py          # Model and prediction functions
│
├── results/                 # Outputs and visualizations
│
├── documentation/           # Project documentation
│   ├── project_outline.docx # Initial project planning document
│   └── sprint_plan.docx     # Sprint structure and ticket details
│
├── individual_work/         # Team member contributions
│   ├── sean/                # Sean's individual work files
│   ├── bryan/               # Bryan's individual work files
│   └── jitesh/              # Jitesh's individual work files
│
├── requirements.txt
└── README.md
```

## Key Deliverables

1. **Pricing Recommendation Tool**
   - Suggested price range based on property features
   - Property type categorization

2. **Amenity Value Analysis**
   - Top 3 high-value amenities to add
   - Estimated price impact for each

3. **Stay Strategy Guidance**
   - Recommended minimum stay approach
   - Supporting neighborhood data
   
4. **Documentation & Presentation**
   - Methodology explanation
   - Stakeholder-focused findings

   ![Pricing Analysis Example](https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200)
---

*This project was created as part of the University of Toronto Data Analytics Bootcamp, 2025.*
