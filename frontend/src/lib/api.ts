const BASE_URL = 'http://localhost:5000'; // Your backend server address

const fetchWithTimeout = async (url: string, options: RequestInit) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. The server is not responding.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const api = {
  async post(endpoint: string, body: object) {
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) { headers['x-auth-token'] = token; }

    // The URL is now correctly constructed
    const response = await fetchWithTimeout(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ msg: "An unknown error occurred" }));
      throw new Error(errorBody.msg || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async get(endpoint: string) {
    const token = localStorage.getItem('authToken');
    if (!token) { 
        window.location.href = '/login';
        throw new Error('No auth token found'); 
    }

    const response = await fetchWithTimeout(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
    });

    if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
    }
    if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
    return response.json();
  },
};