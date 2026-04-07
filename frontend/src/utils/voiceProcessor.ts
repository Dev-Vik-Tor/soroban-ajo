// Voice processing utilities

export function normalizeCommand(command: string): string {
  return command.toLowerCase().trim();
}

export function extractKeywords(command: string): string[] {
  return command.split(' ').filter(word => word.length > 2);
}

export function isCommandSupported(command: string, supportedCommands: string[]): boolean {
  const normalized = normalizeCommand(command);
  return supportedCommands.some(supported =>
    normalized.includes(supported.toLowerCase())
  );
}