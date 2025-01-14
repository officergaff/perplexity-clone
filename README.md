# Perplexity Clone

This is a perplexity clone. It uses Claude and SerpAPI.
Missing features:

- Crawling of the content of the search result links, and then giving it to Claude to ingest. I am currently only giving Claude a sample of the content.
- Authentication.
- Multiple prompts (hold a conversation based on the search results).

# How to Run

First create a .env with the variables:
`VITE_ANTHROPIC_API_KEY`: Your Anthropic api key
`VITE_SERPAPI_KEY`: Your SerpAPI key

1. `npm i`
2. `npm run dev`
