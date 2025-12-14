import { AIMessage, ChatMessage, convertToProviderContentBlock, isDataContentBlock, ToolMessage } from "@langchain/core/messages";
import { convertLangChainToolCallToOpenAI } from "@langchain/core/output_parsers/openai_tools";
import { Converter } from "@langchain/core/utils/format";
import { completionsApiContentBlockConverter, convertStandardContentMessageToCompletionsMessage, OpenAIClient } from "@langchain/openai";
import { BaseMessage } from "langchain";

export function extractGenericMessageCustomRole(message: ChatMessage) {
  if (
    message.role !== "system" &&
    message.role !== "developer" &&
    message.role !== "assistant" &&
    message.role !== "user" &&
    message.role !== "function" &&
    message.role !== "tool"
  ) {
    console.warn(`Unknown message role: ${message.role}`);
  }

  return message.role as OpenAIClient.ChatCompletionRole;
}

export function messageToOpenAIRole(
  message: BaseMessage
): OpenAIClient.ChatCompletionRole {
  const type = message._getType();
  switch (type) {
    case "system":
      return "system";
    case "ai":
      return "assistant";
    case "human":
      return "user";
    case "function":
      return "function";
    case "tool":
      return "tool";
    case "generic": {
      if (!ChatMessage.isInstance(message))
        throw new Error("Invalid generic chat message");
      return extractGenericMessageCustomRole(message);
    }
    default:
      throw new Error(`Unknown message type: ${type}`);
  }
}

export function isReasoningModel(model?: string) {
  if (!model) return false;
  if (/^o\d/.test(model ?? "")) return true;
  if (model.startsWith("gpt-5") && !model.startsWith("gpt-5-chat")) return true;
  return false;
}

export const convertMessagesToCompletionsMessageParams: Converter<
  { messages: BaseMessage[]; model?: string },
  OpenAIClient.Chat.Completions.ChatCompletionMessageParam[]
> = ({ messages, model }) => {
  return messages.flatMap((message) => {
    if (
      "output_version" in message.response_metadata &&
      message.response_metadata?.output_version === "v1"
    ) {
      return convertStandardContentMessageToCompletionsMessage({ message });
    }
    let role = messageToOpenAIRole(message);
    if (role === "system" && isReasoningModel(model)) {
      role = "developer";
    }

    const content =
      typeof message.content === "string"
        ? message.content
        : message.content.map((m) => {
            if (isDataContentBlock(m)) {
              return convertToProviderContentBlock(
                m,
                completionsApiContentBlockConverter
              );
            }
            return m;
          });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completionParam: Record<string, any> = {
      role,
      content,
    };
    if (message.name != null) {
      completionParam.name = message.name;
    }
    if (message.additional_kwargs.function_call != null) {
      completionParam.function_call = message.additional_kwargs.function_call;
    }
    if (AIMessage.isInstance(message) && !!message.tool_calls?.length) {
      completionParam.tool_calls = message.tool_calls.map(
        convertLangChainToolCallToOpenAI
      );
    } else {
      if (message.additional_kwargs.tool_calls != null) {
        completionParam.tool_calls = message.additional_kwargs.tool_calls;
      }
      if (ToolMessage.isInstance(message) && message.tool_call_id != null) {
        completionParam.tool_call_id = message.tool_call_id;
      }
    }

    if (
      message.additional_kwargs.audio &&
      typeof message.additional_kwargs.audio === "object" &&
      "id" in message.additional_kwargs.audio
    ) {
      const audioMessage = {
        role: "assistant",
        audio: {
          id: message.additional_kwargs.audio.id,
        },
      };
      return [
        completionParam,
        audioMessage,
      ] as OpenAIClient.Chat.Completions.ChatCompletionMessageParam[];
    }

    return completionParam as OpenAIClient.Chat.Completions.ChatCompletionMessageParam;
  });
};
