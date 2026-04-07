import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceCommands } from '../hooks/useVoiceCommands';

export function VoiceCommandButton() {
  const { isListening, startListening, stopListening } = useVoiceCommands();

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
        isListening
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}
      aria-label={isListening ? 'Stop voice commands' : 'Start voice commands'}
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      <span>{isListening ? 'Listening...' : 'Voice Commands'}</span>
    </button>
  );
}