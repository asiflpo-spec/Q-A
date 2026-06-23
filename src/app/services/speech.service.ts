import { Injectable, signal } from '@angular/core';

/**
 * Service that wraps the Web Speech API for voice-to-text functionality.
 * Provides reactive signals for listening state and transcript.
 */
@Injectable({ providedIn: 'root' })
export class SpeechService {
    // Reactive signals for UI binding
    isListening = signal(false);
    transcript = signal('');
    error = signal('');

    private recognition: any = null;

    constructor() {
        this.initRecognition();
    }

    /** Initialize the SpeechRecognition instance if browser supports it */
    private initRecognition(): void {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            this.error.set('Speech recognition is not supported in this browser.');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'en-US';
        this.recognition.interimResults = false;
        this.recognition.continuous = false;

        this.recognition.onresult = (event: any) => {
            const result = event.results[0][0].transcript;
            this.transcript.set(result);
            this.isListening.set(false);
        };

        this.recognition.onerror = (event: any) => {
            this.error.set(`Speech error: ${event.error}`);
            this.isListening.set(false);
        };

        this.recognition.onend = () => {
            this.isListening.set(false);
        };
    }

    /** Check if speech recognition is available in this browser */
    isSupported(): boolean {
        return this.recognition !== null;
    }

    /** Start listening for speech input */
    startListening(): void {
        if (!this.recognition) {
            this.error.set('Speech recognition is not supported.');
            return;
        }

        this.error.set('');
        this.transcript.set('');
        this.isListening.set(true);
        this.recognition.start();
    }

    /** Stop listening */
    stopListening(): void {
        if (this.recognition && this.isListening()) {
            this.recognition.stop();
            this.isListening.set(false);
        }
    }
}
