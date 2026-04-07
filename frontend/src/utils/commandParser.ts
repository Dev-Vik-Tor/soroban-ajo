import { normalizeCommand, isCommandSupported } from './voiceProcessor';

export type VoiceCommand = 'show_groups' | 'make_contribution' | 'check_balance' | 'create_group' | 'view_notifications';

const COMMAND_MAPPINGS: Record<string, VoiceCommand> = {
  'show my groups': 'show_groups',
  'make a contribution': 'make_contribution',
  'check my balance': 'check_balance',
  'create new group': 'create_group',
  'view notifications': 'view_notifications',
};

const SUPPORTED_COMMANDS = Object.keys(COMMAND_MAPPINGS);

export function parseVoiceCommand(rawCommand: string): VoiceCommand | null {
  const normalized = normalizeCommand(rawCommand);

  for (const [phrase, command] of Object.entries(COMMAND_MAPPINGS)) {
    if (normalized.includes(phrase)) {
      return command;
    }
  }

  return null;
}

export function isSupportedCommand(command: string): boolean {
  return isCommandSupported(command, SUPPORTED_COMMANDS);
}

export function getCommandDescription(command: VoiceCommand): string {
  const descriptions: Record<VoiceCommand, string> = {
    show_groups: 'Display user groups',
    make_contribution: 'Open contribution form',
    check_balance: 'Show wallet balance',
    create_group: 'Open group creation',
    view_notifications: 'Show notifications',
  };

  return descriptions[command];
}