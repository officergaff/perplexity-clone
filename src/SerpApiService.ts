interface SearchResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
}

class SerpApiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Fetches search results from SerpAPI.
   * @param query - The search query.
   * @param limit - The maximum number of results to return.
   * @returns A promise that resolves to an array of SearchResult objects.
   */
  async search(query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      const response = await fetch(
        `/api/search.json?q=${encodeURIComponent(query)}&api_key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();
      const results = data.organic_results.slice(0, limit);

      return results.map((result: any) => ({
        position: result.position,
        title: result.title,
        link: result.link,
        snippet: result.snippet,
      }));
    } catch (error) {
      console.error("Error fetching search results:", error);
      throw error;
    }
  }
}

export default SerpApiService;
