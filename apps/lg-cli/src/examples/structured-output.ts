import { initChatModel } from "langchain";
import { z } from "zod";

export async function structuredOutputExample() {
  // const modelName = 'ollama:qwen:0.5b';
  // const modelName = 'openai:gpt-5-mini';
  const modelName = 'ollama:devstral-small-2:24b';
  // const systemPrompt = `
  // You are a SQL expert with knowledge about Typescript AST.

  // Your task is to create an SQL query to insert the data into the database.

  // The SQL schema is:

  // \`\`\`sql
  // CREATE TABLE class_declaration (
  //   id INT PRIMARY KEY AUTO_INCREMENT,
  //   name VARCHAR(255) NOT NULL,
  // );
  // \`\`\`

  // You must only respond with the SQL query.
  // `;

  // const model = await initChatModel(modelName);
  // const response = await model.invoke([{
  //   role: 'system',
  //   content: systemPrompt
  // }, {
  //   role: 'user',
  //   content: `
  //  Generate sql query to get all classes
  //   `
  // }]);
  // const systemPrompt = `
  // You are a expert with knowledge about Typescript AST.

  // Your task is to answer user question

  // \`\`\`typescript
  // export class MyClass {
  //   constructor(public name: string) {
  //   }
  // }

  // class SecondClass {
  
  // }
  // \`\`\`

  // You must only respond with the SQL query.
  // `;

  // const model = await initChatModel(modelName);
  // const response = await model.invoke([{
  //   role: 'system',
  //   content: systemPrompt
  // }, {
  //   role: 'user',
  //   content: `
  // How many classes do you see?
  //   `
  // }]);

  const systemPrompt = `
  You are a geography teacher, your task is to answer the user question:
  `;
  const model = await initChatModel(modelName);

  const structuredModel = model.withStructuredOutput(z.object({
    reasoning: z.string(),
    answer: z.string()
  }));

  return await structuredModel.invoke(`
    ${systemPrompt}
  
    Explain how the world was made in 1 sentence
    `
  );
}

export async function respondAsJson() {
  // const modelName = 'ollama:devstral-small-2:24b';
  // const modelName = 'ollama:qwen2.5:0.5b';
  const modelName = 'ollama:deepseek-r1:8b';

  const model = await initChatModel(modelName);
  const structuredModel = model.withStructuredOutput(z.object({
    reasoning: z.string(),
    capital: z.string(),
  }));

  const basicPrompt = `What is the capital of Bungalunga?`;
  const jsonPrompt = `But you should answer in json format using capital as the key and answer as the value`;

  return await structuredModel.invoke(`${basicPrompt}`)
}