import axios from 'axios';

const NEWS_PROXY_URL = import.meta.env.VITE_API_URL;

export async function search(query: string, limit: number = 10): Promise<any> {
  try {
    console.log('Brave Search Request:', {
      url: `${NEWS_PROXY_URL}/api/search/brave`,
      query,
      limit
    });
    
    const response = await axios.get(`${NEWS_PROXY_URL}/api/search/brave`, {
      params: { query, limit },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('Brave Search Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Brave Search Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: `${NEWS_PROXY_URL}/api/search/brave`
    });
    
    // Provide more specific error messages
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to search service. Please ensure the server is running on port 3001.');
    } else if (error.response?.status === 500) {
      throw new Error('Search service error. Please check if BRAVE_SEARCH_API_KEY is configured in server/.env');
    } else if (error.response?.status === 400) {
      throw new Error('Invalid search query');
    } else {
      throw new Error(error.message || 'Failed to perform search');
    }
  }
}

export default { search };
