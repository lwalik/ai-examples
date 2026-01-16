import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "langchain";
import { resolveEmbeddings } from "libs/shared/src/lib/embeddings";
import * as z from "zod";

const loadDocuments = async (): Promise<Document[]> => {
  const pTagSelector = "p";
  const cheerioLoader = new CheerioWebBaseLoader(
    "https://lilianweng.github.io/posts/2023-06-23-agent/",
    {
      selector: pTagSelector,
    }
  );
  
  const docs = await cheerioLoader.load();
  return docs;
}

export async function returningSourceDocsExample() {
const StateSchema = z.object({
  messages: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })),
  context: z.array(z.custom<Document>()),
});

const embeddings = resolveEmbeddings('ollama:mxbai-embed-large');

const vectorStore = new MemoryVectorStore(embeddings);

const docs = await loadDocuments();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const allSplits = await splitter.splitDocuments(docs);

await vectorStore.addDocuments(allSplits);

// const retrieveDocumentsMiddleware = createMiddleware({
//   stateSchema: StateSchema,
//   name: "retrieveDocumentsMiddleware",
//   beforeModel: async (state) => {
//     const lastMessage = state.messages[state.messages.length - 1];
//     const retrievedDocs = await vectorStore.similaritySearch(lastMessage.content, 2);

//     const docsContent = retrievedDocs
//       .map((doc) => doc.pageContent)
//       .join("\n\n");

//     const augmentedMessageContent = [
//         ...lastMessage.content,
//         { type: "text", text: `Use the following context to answer the query:\n\n${docsContent}` }
//     ]

//     // Below we augment each input message with context, but we could also
//     // modify just the system message, as before.
//     return {
//       messages: [{
//         role: 'user',
//         content: augmentedMessageContent,
//       }],
//       context: retrievedDocs,
//     }
//   },
// });

// const agent = createAgent({
//   model: "ollama:mistral:7b",
//   tools: [],
//   middleware: [retrieveDocumentsMiddleware],
// });
}