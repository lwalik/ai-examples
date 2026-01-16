import { initChatModel, tool } from "langchain";

export async function callFilesTools() {
  // const modelName = 'ollama:qwen:0.5b';
  // const modelName = 'ollama:qwen3:0.6B';
  const modelName = 'openai:gpt-3.5-turbo';
//   const systemPrompt = `You are knowledge base assistant
// Your task is to return the content of the file that is related to the user question.

// You have access to the following tools:
//   - listFiles(): string[] - it will list the files in the knowledge base

//   If you need to use one of the tools, you must respond in the following format:
//   \`\`\`tool_call
//   {
//     "tool_name": "listFiles",
//   }
//   \`\`\`
// `;
// const model = new ChatOpenAI({ model: "gpt-4o" });
const model = await initChatModel(modelName);
// const userPrompt = `What are your capabilities?`;
// const userPrompt = `What are your the tools that you can use?`;
const userPrompt = `List all files in the folder`;
const systemPrompt = `You are knowledge base assistant
Your task is to return the content of the file that is related to the user question.
`;
const listFilesTool = tool(
  () => ['angular.txt', 'react.txt'],
  {
    name: "listFiles",
    description: "List the files in the knowledge base",
  }
);
const modelWithTools = model.bindTools([listFilesTool]);  
const response = await modelWithTools.invoke([{role: 'system', content: systemPrompt}, {role: 'user', content: userPrompt}]);
  
return response;
}


export async function rawTools() {
  // const modelName = 'openai:gpt-4o';
  // const modelName = 'ollama:qwen:0.5b';
  // const modelName = 'ollama:smollm2:135m';
  // const modelName = 'ollama:deepseek-r1:8b';
  const modelName = 'ollama:devstral-small-2:24b';
  // const modelName = 'ollama:codegemma:7b';

  const task = "List all files in the folder";
  const tools = `\`\`\`json ${JSON.stringify({
    name: "listFiles",
    description: "List the files in the file system",
  })} \`\`\`
  `;

  const model = await initChatModel(modelName);

  return await model.invoke(`
  ## Tools
  You have access to the following tools:
  <tool>
    ${tools}
  </tool>

  ## Task
  ${task}
  `);

  //`You should invoke the <tool_call>listFiles</tool_call> wrap the answer in <tool_response>`
}