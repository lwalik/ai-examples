import { APP_INITIALIZER, Provider } from "@angular/core";
import { ToolRegistry } from "../tools/tool.registry";
import { LogsState } from "./logs.state";

export function provideLogTools(): Provider {
  return {
    provide: APP_INITIALIZER,
    useFactory: (toolRegistry: ToolRegistry, logsState: LogsState) => {
      return () => {
        // Tool to filter logs by level
        toolRegistry.registerTool('filter_logs_by_level', {
          execute: (args: { level: string }) => {
            logsState.applyFilter({ level: args.level as 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' });
            return `Filtered logs to show only ${args.level} level logs`;
          },
          definition: {
            type: 'function',
            function: {
              name: 'filter_logs_by_level',
            description: 'Filter logs by log level. Only logs matching the specified level will be shown. This affects all log statistics, charts, and recent logs display.',
            parameters: {
              type: 'object',
              properties: {
                level: { 
                  type: 'string', 
                  description: 'The log level to filter by. Must be one of: INFO, WARN, ERROR, or DEBUG.', 
                  enum: ['INFO', 'WARN', 'ERROR', 'DEBUG'] 
                },
              },
              required: ['level'],
            },
          },
        }
        });

        // Tool to clear log filters
        toolRegistry.registerTool('clear_log_filter', {
          execute: () => {
            logsState.applyFilter({});
            return 'Cleared all log filters. All logs are now visible.';
          },
          definition: {
            type: 'function',
            function: {
              name: 'clear_log_filter',
              description: 'Clear all log filters. This will reset the log view to show all logs without any filtering applied. Use this when you want to see the complete log dataset.',
              parameters: {
                type: 'object',
                properties: {},
                required: [],
              },
            },
          }
        });
      };
    },
    deps: [ToolRegistry, LogsState],
    multi: true,
  };
}
