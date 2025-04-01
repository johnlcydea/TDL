// Detect environment and set API base URL
const API_BASE_URL =
  window.location.hostname === "localhost" ? "http://localhost:5001" : ""; // Empty string means use relative URLs in production

// Export the configuration
window.appConfig = {
  API_BASE_URL,
};
