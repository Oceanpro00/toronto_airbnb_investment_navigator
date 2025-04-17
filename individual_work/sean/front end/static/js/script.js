document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const form = document.getElementById('prediction-form');
    const neighborhoodSelect = document.getElementById('neighborhood');
    const propertyTypeSelect = document.getElementById('property_type');
    const neighborhoodSearch = document.getElementById('neighborhood-search');
    const propertySearch = document.getElementById('property-search');
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');
    const priceValue = document.getElementById('price-value');
    const propertyDetails = document.getElementById('property-details');
    
    // Store full lists of options
    let neighborhoodOptions = [];
    let propertyTypeOptions = [];
    
    // Fetch dropdown options
    fetchOptions();
    
    // Add form submit handler
    form.addEventListener('submit', handleSubmit);
    
    // Add search functionality
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
    
    // Fetch neighborhood, property type, and room type options
    function fetchOptions() {
        fetch('/api/options')
            .then(response => response.json())
            .then(data => {
                // Save full lists
                neighborhoodOptions = data.neighborhoods;
                propertyTypeOptions = data.property_types;
                
                // Populate neighborhood dropdown
                populateDropdown(neighborhoodSelect, data.neighborhoods);
                
                // Populate property type dropdown
                populateDropdown(propertyTypeSelect, data.property_types);
                
                // Populate room type dropdown
                const roomTypeSelect = document.getElementById('room_type');
                populateDropdown(roomTypeSelect, data.room_types);
            })
            .catch(error => {
                console.error('Error fetching options:', error);
                showError();
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
    
    // Handle form submission
    function handleSubmit(event) {
        event.preventDefault();
        
        // Hide results and error
        resultsDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');
        
        // Get form values
        const formData = {
            neighborhood: document.getElementById('neighborhood').value,
            property_type: document.getElementById('property_type').value,
            room_type: document.getElementById('room_type').value,
            bedrooms: document.getElementById('bedrooms').value,
            bathrooms: document.getElementById('bathrooms').value,
            accommodates: document.getElementById('accommodates').value
        };
        
        // Validate required fields
        if (!formData.neighborhood || !formData.property_type || !formData.room_type) {
            showError();
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
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showError();
                return;
            }
            
            // Show results
            priceValue.textContent = data.predicted_price;
            propertyDetails.textContent = `${data.property_type} (${data.room_type}) in ${data.neighborhood}`;
            resultsDiv.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error:', error);
            showError();
        });
    }
    
    // Show error message
    function showError() {
        errorDiv.classList.remove('hidden');
    }
});