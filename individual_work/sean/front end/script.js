document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const form = document.getElementById('prediction-form');
    const neighborhoodSelect = document.getElementById('neighborhood');
    const propertyTypeSelect = document.getElementById('property_type');
    const roomTypeSelect = document.getElementById('room_type');
    const neighborhoodSearch = document.getElementById('neighborhood-search');
    const propertySearch = document.getElementById('property-search');
    const amenitiesContainer = document.getElementById('amenities-container');
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');
    
    // Results elements
    const priceValue = document.getElementById('price-value');
    const revenueValue = document.getElementById('revenue-value');
    const occupancyValue = document.getElementById('occupancy-value');
    const propertyDetails = document.getElementById('property-details');
    const baselinePriceValue = document.getElementById('baseline-price-value');
    
    // S3 bucket URL for baseline pricing data
    const BASELINE_PRICING_URL = "https://airbnbgroup3project.s3.us-east-1.amazonaws.com/baseline_pricing.json";
    
    // Organized amenities by category
    const amenities = {
        basic: [
            "Smoke alarm", "Carbon monoxide alarm", "Hot water", "Heating", "Essentials", 
            "Bed linens", "Shampoo", "Shower gel", "Body soap", "Hangers", "Hair dryer",
            "Conditioner", "Fire extinguisher", "Cleaning products", "Private room lock"
        ],
        convenience: [
            "Wifi", "Kitchen", "Microwave", "Refrigerator", "Freezer", "Cooking basics",
            "Stove", "Oven", "Iron", "Air conditioning", "TV", "Dishwasher",
            "Coffee maker", "Hot water kettle", "Self check-in", "Elevator", "Drying rack",
            "Room-darkening shades", "Dishes and silverware", "Toaster"
        ],
        special: [
            "Hot tub", "Pool", "Private entrance", "BBQ grill", "Fire pit",
            "Outdoor dining area", "Patio or balcony", "Gym", "Lake access",
            "Indoor fireplace", "Sound system", "Game console", "EV charger",
            "Security camera", "Pets allowed", "Backyard", "City skyline view", "Board games"
        ],
        other: [
            "Washer", "Dryer", "Bathtub", "Dining table", "Dedicated workspace",
            "Free parking on premises", "Paid parking on premises",
            "Free street parking", "Paid street parking off premises",
            "Books and reading material", "Outdoor furniture",
            "Long term stays allowed", "Luggage dropoff allowed", "Laundromat nearby",
            "Host greets you", "Single level home", "Cleaning available during stay"
        ]
    };
    
    // Data for static version (GitHub Pages)
    const options = {
        neighborhoods: [
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
        ],
        property_types: [
            'condo', 'rental unit', 'townhouse', 'home', 'bungalow',
            'guest suite', 'loft', 'serviced apartment', 'guesthouse',
            'cottage', 'place', 'private room', 'tiny home', 'hostel',
            'villa', 'boutique hotel', 'bed and breakfast',
            'vacation home', 'hotel', 'apartment'
        ],
        room_types: ['Entire home/apt', 'Private room']
    };

    // Function to load the baseline pricing data from S3 bucket
    async function loadBaselinePricing() {
        try {
            const response = await fetch(BASELINE_PRICING_URL);
            if (!response.ok) {
                console.warn('Failed to load baseline pricing data from S3');
                return {};
            }
            return await response.json();
        } catch (error) {
            console.warn('Error loading baseline pricing data:', error);
            return {};
        }
    }

    // Store the baseline pricing data globally
    let baselinePricing = {};

    // Initialize the page and load data
    async function init() {
        // Load baseline pricing data from S3
        showMessage("Loading pricing data...");
        try {
            baselinePricing = await loadBaselinePricing();
            hideMessage();
        } catch (error) {
            showError("Could not load baseline pricing data. Using default pricing model.");
            console.error("Error loading pricing data:", error);
        }
        
        // Populate dropdown fields
        initializePage();
        
        // Add form submit handler
        form.addEventListener('submit', handleSubmit);
        
        // Add search functionality for dropdowns
        if (neighborhoodSearch) {
            neighborhoodSearch.addEventListener('input', function() {
                filterDropdown(this.value, neighborhoodSelect, options.neighborhoods);
            });
        }
        
        if (propertySearch) {
            propertySearch.addEventListener('input', function() {
                filterDropdown(this.value, propertyTypeSelect, options.property_types);
            });
        }
    }
    
    // Show a message to the user
    function showMessage(message) {
        const loadingElement = document.createElement('div');
        loadingElement.id = 'message-indicator';
        loadingElement.className = 'message-indicator';
        loadingElement.innerHTML = `<div class="spinner"></div><div class="message-text">${message}</div>`;
        document.querySelector('.container').appendChild(loadingElement);
    }
    
    // Hide the message
    function hideMessage() {
        const messageElement = document.getElementById('message-indicator');
        if (messageElement) {
            messageElement.remove();
        }
    }
    
    // Initialize the page with options
    function initializePage() {
        // Populate neighborhood dropdown
        populateDropdown(neighborhoodSelect, options.neighborhoods);
        
        // Populate property type dropdown
        populateDropdown(propertyTypeSelect, options.property_types);
        
        // Populate room type dropdown
        populateDropdown(roomTypeSelect, options.room_types);
        
        // Populate amenities checkboxes
        populateCategorizedAmenities(amenitiesContainer, amenities);
    }
    
    // Filter dropdown based on search input
    function filterDropdown(searchText, selectElement, allOptions) {
        // Clear current options except first one
        while (selectElement.options.length > 1) {
            selectElement.remove(1);
        }
        
        // Filter options based on search text
        const filteredOptions = allOptions.filter(option => 
            option.toLowerCase().includes(searchText.toLowerCase())
        );
        
        // Add filtered options
        populateDropdown(selectElement, filteredOptions, true);
    }
    
    // Helper function to populate dropdowns
    function populateDropdown(selectElement, items, keepFirst = false) {
        // If keepFirst is false, clear all options
        if (!keepFirst) {
            selectElement.innerHTML = '<option value="">Select Option</option>';
        }
        
        // Add options to the dropdown
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            selectElement.appendChild(option);
        });
    }
    
    // Create amenities in categorized sections
    function populateCategorizedAmenities(container, amenitiesObj) {
        // Clear loading message
        container.innerHTML = '';
        
        // Create categorized sections
        const categories = {
            basic: { title: "Basic Amenities", items: amenitiesObj.basic, icon: "fas fa-check-circle" },
            convenience: { title: "Convenience Amenities", items: amenitiesObj.convenience, icon: "fas fa-lightbulb" },
            special: { title: "Special Amenities", items: amenitiesObj.special, icon: "fas fa-star" },
            other: { title: "Other Amenities", items: amenitiesObj.other, icon: "fas fa-plus-circle" }
        };
        
        // Create each category section
        Object.keys(categories).forEach(category => {
            const section = document.createElement('div');
            section.className = 'amenities-section';
            
            // Add category heading
            const heading = document.createElement('h3');
            heading.innerHTML = `<i class="${categories[category].icon}"></i> ${categories[category].title}`;
            section.appendChild(heading);
            
            // Create grid for this category
            const grid = document.createElement('div');
            grid.className = 'amenities-grid';
            
            // Add amenities as clickable boxes
            categories[category].items.forEach(amenity => {
                const amenityBox = document.createElement('div');
                amenityBox.className = 'amenity-box';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = 'amenity-' + amenity.toLowerCase().replace(/\s+/g, '-');
                checkbox.name = 'amenities';
                checkbox.value = amenity;
                checkbox.className = 'amenity-checkbox';
                
                const label = document.createElement('label');
                label.htmlFor = checkbox.id;
                label.textContent = amenity;
                label.className = 'amenity-label';
                
                // Make the entire box clickable
                amenityBox.addEventListener('click', function(e) {
                    // Don't toggle if clicking directly on the checkbox (it will toggle itself)
                    if (e.target !== checkbox) {
                        checkbox.checked = !checkbox.checked;
                        
                        // Toggle active class
                        if (checkbox.checked) {
                            amenityBox.classList.add('active');
                        } else {
                            amenityBox.classList.remove('active');
                        }
                    }
                });
                
                // Add change event to checkbox to update the box style
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        amenityBox.classList.add('active');
                    } else {
                        amenityBox.classList.remove('active');
                    }
                });
                
                amenityBox.appendChild(checkbox);
                amenityBox.appendChild(label);
                grid.appendChild(amenityBox);
            });
            
            section.appendChild(grid);
            container.appendChild(section);
        });
    }
    
    // Handle form submission
    function handleSubmit(event) {
        event.preventDefault();
        
        // Hide results and error
        hideResults();
        hideError();
        
        // Show loading state
        showLoading();
        
        // Get selected amenities
        const selectedAmenities = [];
        document.querySelectorAll('input[name="amenities"]:checked').forEach(checkbox => {
            selectedAmenities.push(checkbox.value);
        });
        
        // Get form values
        const formData = {
            neighborhood: document.getElementById('neighborhood').value,
            property_type: document.getElementById('property_type').value,
            room_type: document.getElementById('room_type').value,
            bedrooms: parseFloat(document.getElementById('bedrooms').value) || 1,
            bathrooms: parseFloat(document.getElementById('bathrooms').value) || 1,
            beds: parseFloat(document.getElementById('beds').value) || 1,
            accommodates: parseFloat(document.getElementById('accommodates').value) || 2,
            amenities: selectedAmenities
        };
        
        // Validate required fields
        if (!formData.neighborhood || !formData.property_type || !formData.room_type) {
            hideLoading();
            showError('Please fill in all required fields');
            return;
        }
        
        try {
            // Calculate the prediction using the pricing model
            const prediction = calculatePrediction(formData, baselinePricing);
            
            // Hide loading
            hideLoading();
            
            // Update results
            priceValue.textContent = prediction.price;
            revenueValue.textContent = prediction.revenue;
            occupancyValue.textContent = prediction.occupancy;
            
            // Update property details
            propertyDetails.textContent = `${prediction.property_type} (${prediction.room_type}) in ${prediction.neighborhood}`;
            
            // Update baseline price if available
            if (baselinePriceValue && prediction.baselinePrice) {
                baselinePriceValue.textContent = prediction.baselinePrice;
                document.getElementById('baseline-price-container').classList.remove('hidden');
            } else if (baselinePriceValue) {
                document.getElementById('baseline-price-container').classList.add('hidden');
            }
            
            // Show results
            showResults();
        } catch (error) {
            console.error('Error:', error);
            hideLoading();
            showError(error.message || 'Error calculating predictions');
        }
    }
    
    // Calculate prediction using the pricing model, consulting baseline when needed
    function calculatePrediction(data, baselinePricing) {
        // Start with a base price calculation from our model
        let modelPredictedPrice = calculateModelPrice(data);
        
        // Get the baseline price for this neighborhood and property type
        const baselinePrice = getBaselinePrice(
            data.neighborhood, 
            data.room_type, 
            data.property_type, 
            baselinePricing
        );
        
        // The model's price prediction is prioritized, but we ensure it never goes below baseline
        const finalPrice = Math.max(modelPredictedPrice, baselinePrice);
        
        // Calculate estimated occupancy (in %)
        // This is a simplified formula - better locations and amenities = higher occupancy
        let base_occupancy = 50;  // Start with 50%
        
        // Premium neighborhoods get higher occupancy
        const premium_neighborhoods = ['Bay Street Corridor', 'Waterfront Communities-The Island', 
                                      'Trinity-Bellwoods', 'Annex', 'Little Portugal'];
        if (premium_neighborhoods.includes(data.neighborhood)) {
            base_occupancy += 15;
        }
        
        // More amenities = higher occupancy
        base_occupancy += Math.min(20, data.amenities.length * 2);  // Cap at 20% increase
        
        // Cap occupancy at 90%
        const occupancy = Math.min(90, base_occupancy);
        
        // Calculate estimated monthly revenue
        // Revenue = Price per night * Occupancy rate * 30 days
        const estimated_revenue = finalPrice * (occupancy / 100) * 30;
        
        // Return predictions
        return {
            price: Math.round(finalPrice * 100) / 100,
            revenue: Math.round(estimated_revenue * 100) / 100,
            occupancy: Math.round(occupancy * 10) / 10,
            neighborhood: data.neighborhood,
            property_type: data.property_type,
            room_type: data.room_type,
            baselinePrice: Math.round(baselinePrice * 100) / 100
        };
    }
    
    // Price calculation from our model
    function calculateModelPrice(data) {
        let base_price = 100;
        
        // Property type adjustments
        const property_adjustments = {
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
        };
        
        // Apply property type adjustment
        if (property_adjustments[data.property_type.toLowerCase()]) {
            base_price += property_adjustments[data.property_type.toLowerCase()];
        }
        
        // Apply room type adjustment
        if (data.room_type === "Entire home/apt") {
            base_price += 40;
        } else if (data.room_type === "Private room") {
            base_price += 5;
        }
            
        // Adjust for bedrooms, bathrooms, beds, accommodates
        base_price += (data.bedrooms * 20);
        base_price += (data.bathrooms * 15);
        base_price += (data.beds * 10);
        base_price += (data.accommodates * 5);
        
        // Adjust for amenities (each amenity adds a bit to the price)
        base_price += (data.amenities.length * 3);
        
        // Specific amenity adjustments
        if (data.amenities.includes('Pool')) {
            base_price += 30;
        }
        if (data.amenities.includes('Hot tub')) {
            base_price += 20;
        }
        if (data.amenities.includes('Free parking on premises')) {
            base_price += 15;
        }
        
        // Neighborhood premium adjustments
        const premium_neighborhoods = {
            'Bay Street Corridor': 40,
            'Waterfront Communities-The Island': 35,
            'Rosedale-Moore Park': 50,
            'Trinity-Bellwoods': 30, 
            'Annex': 25,
            'Little Portugal': 20
        };
        
        if (premium_neighborhoods[data.neighborhood]) {
            base_price += premium_neighborhoods[data.neighborhood];
        }
        
        return base_price;
    }
    
    // Helper function to get the baseline price from the data
    function getBaselinePrice(neighborhood, roomType, propertyType, baselinePricing) {
        // Default fallback price if we can't find a match
        const defaultBaselinePrice = 30.0;
        
        // If baseline pricing data isn't available, return default
        if (!baselinePricing || Object.keys(baselinePricing).length === 0) {
            return defaultBaselinePrice;
        }
        
        // Check if we have data for this neighborhood
        if (!baselinePricing[neighborhood]) {
            console.log(`No baseline data for neighborhood: ${neighborhood}`);
            return defaultBaselinePrice;
        }
        
        // Create the key format used in the JSON: "room_type|property_type"
        const key = `${roomType}|${propertyType.toLowerCase()}`;
        
        // Check if we have the exact match for room_type|property_type
        if (baselinePricing[neighborhood][key]) {
            return baselinePricing[neighborhood][key];
        }
        
        // If not found, try to find a fallback with the same room type
        const fallbackKeys = Object.keys(baselinePricing[neighborhood]).filter(k => k.startsWith(roomType + '|'));
        
        if (fallbackKeys.length > 0) {
            // Get the average of all options with the same room type
            const sum = fallbackKeys.reduce((total, k) => total + baselinePricing[neighborhood][k], 0);
            return sum / fallbackKeys.length;
        }
        
        // If still not found, return a default minimum price
        return defaultBaselinePrice;
    }
    
    // UI helper functions
    function showLoading() {
        const loadingElement = document.createElement('div');
        loadingElement.id = 'loading-indicator';
        loadingElement.className = 'loading-indicator';
        loadingElement.innerHTML = '<div class="spinner"></div><div class="loading-text">Calculating predictions...</div>';
        document.querySelector('.container').appendChild(loadingElement);
    }
    
    function hideLoading() {
        const loadingElement = document.getElementById('loading-indicator');
        if (loadingElement) {
            loadingElement.remove();
        }
    }
    
    function showResults() {
        resultsDiv.classList.remove('hidden');
        // Smooth scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    function hideResults() {
        resultsDiv.classList.add('hidden');
    }
    
    function showError(message) {
        errorDiv.querySelector('p').textContent = message || 'Error calculating predictions. Please try again.';
        errorDiv.classList.remove('hidden');
        
        // Auto-hide error after 5 seconds
        setTimeout(function() {
            hideError();
        }, 5000);
    }
    
    function hideError() {
        errorDiv.classList.add('hidden');
    }
    
    // Start the application
    init();
});