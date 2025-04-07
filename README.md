# Toronto AirBnB Investment Navigator

![Toronto Skyline](https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&q=80&w=1200)

## Project Overview

The **Toronto AirBnB Investment Navigator** is a data-driven tool that helps real estate investors identify high-potential neighborhoods for short-term rental investments in Toronto. By analyzing Inside AirBnB data and integrating property values, this tool provides actionable insights on neighborhood investment potential and expected returns for the Toronto short-term rental market.

This project applies machine learning techniques to classify Toronto neighborhoods by investment potential, identify factors driving rental performance, and calculate return on investment metrics for property investors.

## Team Members
- **Sean Schallberger**
- **Bryan Carney**
- **Jitesh Makan**

## Stakeholders: Real Estate Investors

Our tool is designed specifically for:
- **Individual property investors** seeking to purchase AirBnB properties
- **Current AirBnB hosts** looking to expand their portfolio

Our stakeholders need:
- Clear identification of high-ROI neighborhoods
- Understanding of property value to rental income ratios
- Data-driven investment recommendations

## Data Sources

Our analysis uses data from:

1. **[Inside AirBnB Toronto](https://insideairbnb.com/get-the-data/)** (March 2, 2025):
   - `listings.csv.gz` - Property details, pricing, and features
   - `calendar.csv.gz` - Availability and booking data
   - `reviews.csv.gz` - Guest feedback and ratings
   - `neighbourhoods.geojson` - Geographic boundaries

2. **Toronto Property Values**:
   - Toronto Real Estate Board neighborhood price data

## Machine Learning Approach

Our analysis will use a simplified set of models to provide clear investment insights:

| Investor Need | ML Model | Output |
|---------------|----------|--------|
| Identify investment-worthy neighborhoods | **K-means Clustering** | Neighborhood categories by investment potential |
| Understand rental performance | **Linear Regression** | Key factors affecting rental income |
| Compare investment options | **Investment Score Algorithm** | ROI ranking for neighborhoods |

### Model Details 

1. **K-means Clustering**
   - **Purpose**: Group neighborhoods by AirBnB performance
   - **Features**: Average price, occupancy rate, review scores
   - **Output**: Investment potential categories (High, Medium, Low)

2. **Linear Regression**
   - **Purpose**: Identify factors that influence rental income
   - **Features**: Property size, amenities, location
   - **Output**: Feature importance for rental success

3. **Investment Score Algorithm**
   - **Purpose**: Rank neighborhoods by ROI potential
   - **Formula**: (Avg. Revenue / Property Value) × Occupancy Rate

## Project Timeline (14 Days)

### Pre-Project Setup
- Download all datasets from Inside AirBnB Toronto
- Acquire Toronto property value data

### Sprint 1: Data Cleaning & Exploration (5 days)
**Tasks**:
- **All Team**: Jointly clean and explore datasets during Monday class
- **Sean**: Focus on listings data analysis
- **Bryan**: Handle property value integration
- **Jitesh**: Analyze booking and review patterns

**Checkpoint (Friday)**: Complete data cleaning and initial analysis

### Sprint 2: Modeling & Visualization (5 days)
**Tasks**:
- **Sean**: Implement K-means clustering
- **Bryan**: Develop linear regression and ROI calculation
- **Jitesh**: Create interactive map visualization

**Checkpoint (Friday)**: Complete core models and visualization framework

### Sprint 3: Integration & Presentation (4 days)
**Tasks**:
- **All Team**: Finalize dashboard and documentation
- **All Team**: Prepare and practice presentation

**Final Presentation**: Deliver project presentation

## Exploratory Data Analysis Plan

Our focused EDA will examine:

1. **Neighborhood Analysis**
   - Property distribution across Toronto
   - Price ranges by neighborhood
   - Review ratings geographical patterns

2. **Financial Analysis**
   - Occupancy rates calculation
   - Revenue potential estimation
   - Property value to rental income ratios

## Project Structure

```
toronto_airbnb_investment_navigator/
│
├── data/
│   ├── raw/                 # Original datasets
│   └── processed/           # Cleaned datasets
│
├── notebooks/
│   ├── 1_data_cleaning.ipynb
│   ├── 2_exploratory_analysis.ipynb
│   ├── 3_modeling.ipynb
│   └── 4_visualization.ipynb
│
├── src/
│   ├── data_processing.py   # Data cleaning functions
│   ├── modeling.py          # ML model implementation
│   └── visualization.py     # Map code
│
├── app/
│   ├── static/              # CSS and JavaScript
│   └── templates/           # HTML files
│
├── results/                 # Output files and visualizations
│
└── README.md
```

## Key Deliverables

1. **Interactive Toronto Investment Map**
   - Color-coded neighborhoods by investment potential
   - Key metrics on hover/click

2. **Investment Analysis Summary**
   - Top neighborhoods ranked by ROI potential
   - Investment recommendations table
   
   ![Investment Analysis Example](https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200)

3. **Documentation & Presentation**
   - Methodology explanation
   - Stakeholder-focused findings

---

*This project was created as part of the University of Toronto Data Analytics Bootcamp, 2025.*
