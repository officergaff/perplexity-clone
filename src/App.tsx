import { useState } from "react";
import SerpApiService from "./SerpApiService";
import ClaudeService from "./ClaudeService";

interface SearchResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
}

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [answer, setAnswer] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Initialize services with API keys from environment variables
  const serpApiService = new SerpApiService(import.meta.env.VITE_SERPAPI_KEY);
  const claudeService = new ClaudeService(
    import.meta.env.VITE_ANTHROPIC_API_KEY
  );

  /**
   * Replaces numbered citations in the AI response with clickable links.
   * @param text - The AI response text.
   * @param searchResults - The search results containing links.
   * @returns The formatted text with clickable citations.
   */
  const formatCitations = (
    text: string,
    searchResults: SearchResult[]
  ): JSX.Element[] => {
    const parts = text.split(/(\[\d+\])/g); // Split text by citations like [1], [2], etc.
    return parts.map((part, index) => {
      const citationMatch = part.match(/\[(\d+)\]/); // Check if the part is a citation
      if (citationMatch) {
        const citationNumber = parseInt(citationMatch[1], 10) - 1; // Convert to zero-based index
        const result = searchResults[citationNumber];
        if (result) {
          return (
            <a
              key={index}
              href={result.link}
              target="_blank"
              rel="noopener noreferrer"
              className="citation-link"
            >
              {part}
            </a>
          );
        }
      }
      return <span key={index}>{part}</span>; // Return plain text if not a citation
    });
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Step 1: Fetch search results using SerpApiService
      const results = await serpApiService.search(query, 5);
      setSearchResults(results);

      // Step 2: Generate a summary using ClaudeService
      setIsAILoading(true); // Start AI loading
      const summary = await claudeService.generateSummary(query, results);
      setAnswer(summary);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while fetching data."); // Show error message to the user
    } finally {
      setLoading(false);
      setIsAILoading(false); // Stop AI loading
    }
  };

  return (
    <div className="container">
      <div className="search-container">
        <div className="search-bar">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Ask anything..."
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Step 3: Display the AI-generated answer with citations */}
        {isAILoading && (
          <div className="ai-loading">
            <h2>AI Response:</h2>
            <div className="loading-spinner">
              <div className="spinner"></div>
              <span>Generating response...</span>
            </div>
          </div>
        )}

        {answer && !isAILoading && (
          <div className="ai-response">
            <h2>AI Response:</h2>
            <div className="pre-wrap">
              {formatCitations(answer, searchResults)}
            </div>
          </div>
        )}

        {/* Step 4: Display the raw search results with source links */}
        {searchResults.length > 0 && (
          <div className="search-results">
            <h2>Search Results:</h2>
            <div className="results-list">
              {searchResults.map((result, index) => (
                <div key={result.position} className="result-item">
                  <div className="result-content">
                    <span className="result-number">{index + 1}.</span>
                    <div>
                      <a
                        href={result.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="result-link"
                      >
                        {result.title}
                      </a>
                      <p className="result-snippet">{result.snippet}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
