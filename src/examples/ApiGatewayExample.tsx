import React, { useEffect, useState } from 'react';
import apiClient from '../services/api-client';
import type { Category, Procedure, Company } from '../types/api';

/**
 * Example component demonstrating the use of the API Gateway
 * through the Market Insights API Client
 */
const ApiGatewayExample: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the API client to fetch categories
        const categoriesData = await apiClient.getCategories();
        setCategories(categoriesData);
        
        // If categories exist, select the first one by default
        if (categoriesData.length > 0) {
          setSelectedCategory(String(categoriesData[0].id));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch procedures when a category is selected
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchProcedures = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the API client to fetch procedures
        const proceduresData = await apiClient.getProcedures();
        setProcedures(proceduresData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch procedures');
      } finally {
        setLoading(false);
      }
    };

    fetchProcedures();
  }, [selectedCategory]);

  // Handle category selection
  const handleCategoryChange = (_event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(_event.target.value);
  };

  // Handle search
  const handleSearch = async (_event: React.FormEvent<HTMLFormElement>) => {
    _event.preventDefault();
    const formData = new FormData(_event.currentTarget);
    const searchQuery = formData.get('searchQuery') as string;
    
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Use the API client to search for procedures
      const searchResults = await apiClient.searchProcedures(searchQuery);
      setProcedures(searchResults);
      setSelectedCategory(null); // Clear selected category when searching
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-gateway-example">
      <h1>Market Insights API Gateway Example</h1>
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="search-form">
        <input 
          type="text" 
          name="searchQuery" 
          placeholder="Search procedures..." 
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>
      
      {/* Category selector */}
      <div className="category-selector">
        <label htmlFor="category-select">Filter by category:</label>
        <select 
          id="category-select" 
          value={selectedCategory || ''} 
          onChange={handleCategoryChange}
          disabled={loading || categories.length === 0}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={String(category.id)}>
              {category.name} ({category.procedures?.length || 0})
            </option>
          ))}
        </select>
      </div>
      
      {/* Loading state */}
      {loading && <div className="loading">Loading...</div>}
      
      {/* Error state */}
      {error && <div className="error">Error: {error}</div>}
      
      {/* Results */}
      {!loading && !error && (
        <div className="results">
          <h2>
            {selectedCategory 
              ? `Procedures in ${categories.find(c => String(c.id) === selectedCategory)?.name}` 
              : 'Search Results'}
          </h2>
          
          {procedures.length === 0 ? (
            <p>No procedures found.</p>
          ) : (
            <ul className="procedures-list">
              {procedures
                .filter(proc => !selectedCategory || String(proc.category_id) === selectedCategory)
                .map(procedure => (
                  <li key={procedure.id} className="procedure-item">
                    <h3>{procedure.name}</h3>
                    <p>{procedure.description || 'No description available'}</p>
                    <div className="procedure-details">
                      <span className="category">Category: {procedure.category_name || 'N/A'}</span>
                      <span className="cost">Average Cost: ${(procedure.average_cost || 0).toLocaleString()}</span>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
      
      {/* API Client Usage Examples */}
      <div className="code-examples">
        <h2>API Client Usage Examples</h2>
        <pre>
          {`
// Import the API client
import apiClient from '../services/api-client';

// Get all categories
const categories = await apiClient.getCategories();

// Get procedures
const procedures = await apiClient.getProcedures();

// Search for procedures
const searchResults = await apiClient.searchProcedures(searchQuery);

// Get market growth data
const marketData = await apiClient.getMarketGrowth(procedureId);

// Set authentication token
apiClient.setAuthToken('your-jwt-token');

// Clear authentication token
apiClient.clearAuthToken();
          `}
        </pre>
      </div>
    </div>
  );
};

export default ApiGatewayExample;
