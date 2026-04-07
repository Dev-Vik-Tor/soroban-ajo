import { useState, useEffect, useRef } from 'react';
import { parseVoiceCommand } from '../utils/commandParser';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

export function useVoiceCommands(onCommand?: (command: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const recognition = useRef<SpeechRecognition>();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;

      recognition.current.onresult = (event) => {
        const command = event.results[0][0].transcript;
        processCommand(command);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const processCommand = (command: string) => {
    const parsedCommand = parseVoiceCommand(command);
    if (parsedCommand && onCommand) {
      onCommand(parsedCommand);
    }
  };

  const startListening = () => {
    if (recognition.current && !isListening) {
      recognition.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition.current && isListening) {
      recognition.current.stop();
      setIsListening(false);
    }
  };

  return { isListening, startListening, stopListening };
}