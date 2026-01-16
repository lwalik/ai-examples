import { initChatModel } from "langchain";

export async function basicExample() {
  // const modelName = 'openai:gpt-4o-mini';
  // const modelName = 'ollama:qwen:0.5b';
  // const modelName = 'ollama:smollm2:135m';
  const modelName = 'ollama:deepseek-r1:8b';
  // const modelName = 'ollama:devstral-small-2:24b';
  // const modelName = 'ollama:codegemma:7b';

  const role = 'You are a typescript expert';
  const task = 'Your task is to generate the model';
  const rules = 'Models must be immutable which means all of the properties must be readonly';
  const format = `Respond in JSON Format according to this schema:
\`\`\`json
{
 "class": { "id": string, "name": string } 
}
\`\`\
  
  `
  // const tone = 'You must respond in a friendly tone';

  const model = await initChatModel(modelName);

  return await model.invoke(`
## Role
${role}

## Task
${task}

## Rules
${rules}

## Response Format
${format}
`);
}