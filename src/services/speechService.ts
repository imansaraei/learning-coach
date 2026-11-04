// Web Speech API Service ($0 runtime cost)

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isRecognitionActive: boolean = false;
  private recognitionInstance: any = null;
  private speechRate: number = 0.95;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public setRate(rate: number): void {
    this.speechRate = rate;
    if (this.currentUtterance) {
      this.currentUtterance.rate = rate;
    }
  }

  public getRate(): number {
    return this.speechRate;
  }

  public getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this.currentUtterance;
  }

  // --- Text-to-Speech (TTS) ---

  public isTtsSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public speak(text: string, onEnd?: () => void, onError?: () => void): void {
    if (!this.synth) {
      onError?.();
      return;
    }

    this.stop(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    // Try finding Persian or appropriate voice
    const voices = this.synth.getVoices();
    const faVoice = voices.find(v => v.lang.startsWith('fa') || v.lang.includes('IR'));
    if (faVoice) {
      utterance.voice = faVoice;
    }

    utterance.lang = 'fa-IR';
    utterance.rate = this.speechRate; // User selected or measured rate
    utterance.pitch = 1.0;

    utterance.onend = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('TTS error:', e);
      this.currentUtterance = null;
      onError?.();
    };

    this.synth.speak(utterance);
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return !!(this.synth && this.synth.speaking);
  }

  // --- Speech-to-Text (STT / Voice Input) ---

  public isSttSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  public startListening(
    onResult: (transcript: string) => void,
    onStatusChange?: (isListening: boolean) => void,
    onError?: (error: string) => void
  ): () => void {
    if (!this.isSttSupported()) {
      onError?.('مرورگر شما از ورودی صوتی پشتیبانی نمی‌کند.');
      return () => {};
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      this.recognitionInstance = recognition;
      recognition.lang = 'fa-IR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        this.isRecognitionActive = true;
        onStatusChange?.(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          onResult(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        this.isRecognitionActive = false;
        onStatusChange?.(false);
        onError?.(event.error);
      };

      recognition.onend = () => {
        this.isRecognitionActive = false;
        onStatusChange?.(false);
      };

      recognition.start();

      // Return cleanup stopper
      return () => {
        try {
          recognition.stop();
        } catch (_) {}
        this.isRecognitionActive = false;
        onStatusChange?.(false);
      };
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      onError?.('امکان فعال‌سازی میکروفون وجود ندارد.');
      return () => {};
    }
  }

  public stopListening(): void {
    if (this.recognitionInstance && this.isRecognitionActive) {
      try {
        this.recognitionInstance.stop();
      } catch (_) {}
      this.isRecognitionActive = false;
    }
  }
}

export const speechService = new SpeechService();
