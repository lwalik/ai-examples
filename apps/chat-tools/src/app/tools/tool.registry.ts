import { Injectable } from "@angular/core";
import { OllamaTool } from "../llm/ollama.service";

export interface ToolContext {
  definition: OllamaTool;
  execute: (args: any) => string | void;
}

@Injectable({providedIn: 'root'})
export class ToolRegistry {
  private readonly TOOLS: Record<string, ToolContext> = {}

  registerTool(name: string, tool: ToolContext) {
    this.TOOLS[name] = tool;
  }
  
  getAll(): OllamaTool[] {
    return Object.values(this.TOOLS).map(tool => tool.definition);
  }

  getByName(name: string) {
    return this.TOOLS[name];
  }
}