/**
 * Simple logger function using console.error for MCP servers
 */
export function log(message: string, ...args: unknown[]): void {
  console.error(`[MCP] ${message}`, ...args);
}
