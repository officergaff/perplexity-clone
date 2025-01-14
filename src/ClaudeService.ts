// src/services/ClaudeService.ts

import Anthropic from "@anthropic-ai/sdk";

interface SearchResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
}

class ClaudeService {
  private anthropic: Anthropic;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true, // Only for frontend use
    });
  }

  /**
   * Generates a summary using Claude based on search results.
   * @param query - The user's query.
   * @param searchResults - An array of search results.
   * @returns A promise that resolves to the generated summary with numbered citations.
   */
  async generateSummary(
    query: string,
    searchResults: SearchResult[]
  ): Promise<string> {
    try {
      // Prepare search context for Claude with numbered citations
      const searchContext = searchResults
        .map(
          (result, index) =>
            `[${index + 1}] ${result.title}: ${result.snippet}\nSource: ${
              result.link
            }\n\n`
        )
        .join("");

      // Generate the summary using Claude

      const msg = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 3000,
        temperature: 0,
        system:
          "You are a helpful assistant that answers questions based on search results. " +
          "Structure your response with clear headings and subheadings. " +
          "Use bullet points or numbered lists for clarity. " +
          "Always cite your sources using numbered citations like [1], [2], etc. " +
          "Be concise but thorough, and ensure the response directly answers the query." +
          "You can omit the citations section at the end",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Here are some search results for the query "${query}":\n\n${searchContext}\n\nBased on these search results, please answer the question: ${query}`,
              },
            ],
          },
        ],
      });
      return msg.content[0].text;
    } catch (error) {
      console.error("Error generating summary with Claude:", error);
      throw error;
    }
  }
}

export default ClaudeService;
