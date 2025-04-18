document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const form = document.getElementById('prediction-form');
    const neighborhoodSelect = document.getElementById('neighborhood');
    const propertyTypeSelect = document.getElementById('property_type');
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
    
    // Store full lists of options
    let neighborhoodOptions = [];
    let propertyTypeOptions = [];
    let amenitiesOptions = [];
    
    // Fetch dropdown options
    fetchOptions();
    
    // Add form submit handler
    form.addEventListener('submit', handleSubmit);
    
    // Add search functionality for dropdowns
    if (neighborhoodSearch) {
        neighborhoodSearch.addEventListener('input', function() {
            filterDropdown(this.value, neighborhoodSelect, neighborhoodOptions);
        });
    }
    
    if (propertySearch) {
        propertySearch.addEventListener('input', function() {
            filterDropdown(this.value, propertyTypeSelect, propertyTypeOptions);
        });
    }
    
    // Fetch all options from API
    function fetchOptions() {
        fetch('/api/options')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Save full lists
                neighborhoodOptions = data.neighborhoods;
                propertyTypeOptions = data.property_types;
                amenitiesOptions = data.amenities;
                
                // Populate neighborhood dropdown
                populateDropdown(neighborhoodSelect, data.neighborhoods);
                
                // Populate property type dropdown
                populateDropdown(propertyTypeSelect, data.property_types);
                
                // Populate room type dropdown
                const roomTypeSelect = document.getElementById('room_type');
                populateDropdown(roomTypeSelect, data.room_types);
                
                // Populate amenities checkboxes
                populateAmenities(amenitiesContainer, data.amenities);
            })
            .catch(error => {
                console.error('Error fetching options:', error);
                showError('Failed to load options. Please refresh the page.');
            });
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
    
    // Create amenities checkboxes
    function populateAmenities(container, amenities) {
        // Clear loading message
        container.innerHTML = '';
        
        // Create grid for amenities
        const grid = document.createElement('div');
        grid.className = 'amenities-grid';
        
        // Add amenities as checkboxes
        amenities.forEach(amenity => {
            const amenityItem = document.createElement('div');
            amenityItem.className = 'amenity-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'amenity-' + amenity.toLowerCase().replace(/\s+/g, '-');
            checkbox.name = 'amenities';
            checkbox.value = amenity;
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = amenity;
            
            amenityItem.appendChild(checkbox);
            amenityItem.appendChild(label);
            grid.appendChild(amenityItem);
        });
        
        container.appendChild(grid);
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
            bedrooms: document.getElementById('bedrooms').value,
            bathrooms: document.getElementById('bathrooms').value,
            beds: document.getElementById('beds').value,
            accommodates: document.getElementById('accommodates').value,
            amenities: selectedAmenities
        };
        
        // Validate required fields
        if (!formData.neighborhood || !formData.property_type || !formData.room_type) {
            hideLoading();
            showError('Please fill in all required fields');
            return;
        }
        
        // Send prediction request
        fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.error || 'Unknown error');
                });
            }
            return response.json();
        })
        .then(data => {
            // Hide loading
            hideLoading();
            
            // Update results
            priceValue.textContent = data.price;
            revenueValue.textContent = data.revenue;
            occupancyValue.textContent = data.occupancy;
            
            // Update property details
            propertyDetails.textContent = `${data.property_type} (${data.room_type}) in ${data.neighborhood}`;
            
            // Show results
            showResults();
        })
        .catch(error => {
            console.error('Error:', error);
            hideLoading();
            showError(error.message || 'Error calculating predictions');
        });
    }
    
    // UI helper functions
    function showLoading() {
        const loadingElement = document.createElement('div');
        loadingElement.id = 'loading-indicator';
        loadingElement.className = 'loading-indicator';
        loadingElement.innerHTML = '<div class="spinner"></div><p>Calculating predictions...</p>';
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
    }
    
    function hideError() {
        errorDiv.classList.add('hidden');
    }
});