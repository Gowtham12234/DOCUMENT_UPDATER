// client/src/api/api.js
console.log("--- API FILE LOADED SUCCESSFULLY ---");

const FLASK_API_URL = 'http://localhost:5000'; 

const api = {
 
  uploadAndSummarize: async (file, length) => {
    if (!file) {
      throw new Error('No file provided to uploadAndSummarize().');
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('length', length);

    try {
      console.log('Uploading file to', `${FLASK_API_URL}/upload_and_summarize`);
      const response = await fetch(`${FLASK_API_URL}/upload_and_summarize`, {
        method: 'POST',
        body: formData,
        
      });

      console.log('Response status:', response.status);

      
      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        console.error('Failed to parse JSON from response:', parseErr);
        throw new Error(`Invalid JSON response from server (status ${response.status}).`);
      }

      if (!response.ok) {
        // If server returned an error, propagate the server message if present
        const serverMsg = data && data.message ? data.message : `Server error with status ${response.status}`;
        console.error('Server error:', serverMsg);
        throw new Error(serverMsg);
      }

      // Expected shape: { summary: "...", raw_text: "...", message: "..." }
      return data;
    } catch (error) {
      console.error('API Call Error:', error);
      // Re-throw with a friendly message for the UI to display
      throw new Error(`API Connection Error: ${error.message}`);
    }
  }
};

export default api;
