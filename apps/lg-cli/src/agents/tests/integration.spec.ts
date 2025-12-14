import { ChatCompletionMessage, createTrajectoryMatchEvaluator } from "agentevals";
import { AIMessage, BaseMessage, createAgent, HumanMessage, tool, ToolMessage } from "langchain";
import * as z from "zod";
import { convertMessagesToCompletionsMessageParams } from "../../langchain/langchain-openai";

const getWeather = tool(
  async ({ city }: { city: string }) => {
    return `It's 75 degrees and sunny in ${city}.`;
  },
  {
    name: "get_weather",
    description: "Get weather information for a city.",
    schema: z.object({
      city: z.string(),
    }),
  }
);

const agent = createAgent({
  // model: "gpt-4o",
  model: "ollama:mistral:7b",
  tools: [getWeather]
});;  

it('should test weather tool called strict', async () => {
  const result = await agent.invoke({
    messages: [ {role: 'user', content: "What's the weather in San Francisco?" }]
  });

  // const messages = result.messages.map(message => convertMessagesToOpenAIParams(message));

  const referenceTrajectory: BaseMessage[] = [
    // {role: 'user', content: "What's the weather in San Francisco?"},
    new HumanMessage({
      content: "What's the weather in San Francisco?"
    }),
    new AIMessage({
      content: "",
      tool_calls: [
        { id: "call_1", name: "get_weather", args: { city: "San Francisco" } }
      ]
    }),
    new ToolMessage({
      content: "It's 75 degrees and sunny in San Francisco.",
      tool_call_id: "call_1"
    }),
    new AIMessage("The weather in San Francisco is 75 degrees and sunny."),
  ];

  // console.log(referenceTrajectory);
  // expect(true).toBe(true);
  const evaluator = createTrajectoryMatchEvaluator({  
    trajectoryMatchMode: "strict",  // unordered, subset, superset
  });
  const evaluation = await evaluator({
    outputs: convertMessagesToCompletionsMessageParams(result) as ChatCompletionMessage[],
    referenceOutputs: convertMessagesToCompletionsMessageParams({ messages: referenceTrajectory }) as ChatCompletionMessage[]
  });

  console.log(evaluation);
  // {
  //     'key': 'trajectory_strict_match',
  //     'score': true,
  //     'comment': null,
  // }
  expect(evaluation.score).toBe(true);
});