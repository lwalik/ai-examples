import { writeFileSync } from "fs";
import { initChatModel } from "langchain";
import * as z from "zod";
import { MATCH_NODES_FEATURES } from "./examples";

export async function cypherTestExample() {
  const structuredOutput = z.object({
    reasoning: z.string().describe('The reasoning process'),
    query: z.string().describe('The Cypher query to match the nodes'),
    confidence: z.number().describe('The confidence in the query'),
  });
  // const modelName = 'ollama:mistral:7b'; // so-so
  // const modelName = 'ollama:codegemma:7b'; // so-so adds unnecessary relationships
  const modelName = 'ollama:devstral-small-2:latest'; // not bad - MATCH (a:A | a:B) RETURN a
  // const modelName = 'openai:gpt-4o-mini'; // good - mixed up OR with AND but otherwise good
  // const modelName = 'openai:gpt-5-mini' // perfect
  // const modelName = 'anthropic:claude-sonnet-4-5-20250929' // perfect
  const result = [];
  for (const feature of MATCH_NODES_FEATURES) {
  const model = await initChatModel(modelName);
  const structuredModel = model.withStructuredOutput(structuredOutput);
  const systemPrompt = `You are a Cypher query language (Neo4j) expert.
You have extensive experience building knowledge graphs and are very fluent in best practices with modeling relationships and nodes using Neo4j standards

Your task is to build a MATCH query for a specific user query written in natural language.

For the purpose of this example, assume there is a graph with nodes and properties.

All the required information will be in the user query and you can safely assume the graph contains all the information needed to build the query.
`

  const response = await structuredModel.invoke([{
    role: 'system',
    content: systemPrompt
  },{
    role: 'user',
    content: feature.name
  }]);

  result.push({
    name: feature.name,
    expectedQueries: feature.queries.map(query => query.join(' ')).join('\n'),
    actualQuery: response.query,
    log: `[${response.confidence}] ${response.reasoning}`,
    correctness: -1
  });
}
writeFileSync(`/Users/greg/Desktop/projects/lowgular/vibe-projects/lg-chatbot/apps/lg-cli/src/examples/cypher-test/results/${modelName.replace(/:/g, '-')}.json`, JSON.stringify(result, null, 2));
  return 'done';
}