import { APP_INITIALIZER, Provider } from "@angular/core";
import { ToolRegistry } from "../tools/tool.registry";
import { ThemeService } from "./theme.service";

export function provideThemeTool(): Provider {
  return {
    provide: APP_INITIALIZER,
    useFactory: (toolRegistry: ToolRegistry, themeService: ThemeService) => {
      return () => {
        toolRegistry.registerTool('change_theme', {
          execute: (args: { theme: 'light' | 'dark' }) => {
            console.log('change_theme', args);
            const theme = args.theme.toLowerCase();
            if (theme !== 'light' && theme !== 'dark') {
              return 'Could not change the theme try this spelling: light or dark';
            }
            themeService.changeTheme(theme);
            return `Theme changed to ${theme}`;
          },
          definition: {
            type: 'function',
            function: {
              name: 'change_theme',
              description: 'Change the theme of the application. The only parameter values are light and dark.',
              parameters: {
                type: 'object',
                properties: {
                  theme: { type: 'string', description: 'The theme to change to', enum: ['light', 'dark'] },
                },
                required: ['theme'],
              },
            },
          }
        });
      };
    },
    deps: [ToolRegistry, ThemeService],
    multi: true,
  };
}
