// Natural Persian TTS & Speech Recognition Service
// Primary: High-fidelity Iranian Persian Neural TTS (/api/tts)
// Secondary Fallback: Web Speech API (speechSynthesis)

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private isRecognitionActive: boolean = false;
  private recognitionInstance: any = null;
  private speechRate: number = 0.95;
  private audioCache = new Map<string, string>();
  private isAudioLoading: boolean = false;

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
    if (this.currentAudioElement) {
      this.currentAudioElement.playbackRate = rate;
    }
  }

  public getRate(): number {
    return this.speechRate;
  }

  public getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this.currentUtterance;
  }

  public isTtsSupported(): boolean {
    return true; // We support natural server-side audio playback in all browsers
  }

  public isSpeaking(): boolean {
    const isSynthSpeaking = !!(this.synth && this.synth.speaking);
    const isAudioPlaying = !!(this.currentAudioElement && !this.currentAudioElement.paused);
    return isSynthSpeaking || isAudioPlaying || this.isAudioLoading;
  }

  public stop(): void {
    // Stop server-side audio if playing
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }

    // Stop native synth if speaking
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }

    this.isAudioLoading = false;
  }

  /**
   * Speak Persian text with Natural Neural Voice
   * First tries high-fidelity Gemini 3.8 Neural TTS endpoint (/api/tts).
   * If offline or API unavailable, seamlessly falls back to browser voice.
   */
  public async speak(
    text: string,
    onEnd?: () => void,
    onError?: (err?: any) => void,
    onStart?: () => void
  ): Promise<void> {
    const cleanText = text.trim();
    if (!cleanText) {
      onEnd?.();
      return;
    }

    this.stop(); // Stop any ongoing playback

    // Check memory cache first
    const cacheKey = `${cleanText}_${this.speechRate}`;
    if (this.audioCache.has(cacheKey)) {
      const cachedSrc = this.audioCache.get(cacheKey)!;
      this.playAudioSource(cachedSrc, onEnd, onError, onStart);
      return;
    }

    // Attempt Server-Side Natural Neural Voice
    try {
      this.isAudioLoading = true;
      const clientApiKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          clientApiKey: clientApiKey || undefined,
          voice: 'Sulafat', // Warm and natural Persian tone
          style: 'calm, natural and wise Persian recitation'
        })
      });

      if (response.ok) {
        const json = await response.json() as any;
        if (json.audioBase64) {
          const mimeType = json.mimeType || 'audio/wav';
          const audioSrc = `data:${mimeType};base64,${json.audioBase64}`;
          this.audioCache.set(cacheKey, audioSrc);
          this.isAudioLoading = false;
          this.playAudioSource(audioSrc, onEnd, onError, onStart);
          return;
        }
      }
    } catch (e) {
      console.warn('Neural TTS request failed, falling back to Web Speech API:', e);
    } finally {
      this.isAudioLoading = false;
    }

    // Fallback: Browser Web Speech API
    this.speakNativeFallback(cleanText, onEnd, onError, onStart);
  }

  private playAudioSource(
    src: string,
    onEnd?: () => void,
    onError?: (err?: any) => void,
    onStart?: () => void
  ): void {
    try {
      const audio = new Audio(src);
      this.currentAudioElement = audio;
      audio.playbackRate = this.speechRate;

      audio.onplay = () => {
        onStart?.();
      };

      audio.onended = () => {
        this.currentAudioElement = null;
        onEnd?.();
      };

      audio.onerror = (e) => {
        console.warn('Audio playback error:', e);
        this.currentAudioElement = null;
        onError?.(e);
      };

      audio.play().catch((err) => {
        console.warn('Audio play failed (maybe autoplay blocked):', err);
        this.currentAudioElement = null;
        onError?.(err);
      });
    } catch (err) {
      this.currentAudioElement = null;
      onError?.(err);
    }
  }

  private speakNativeFallback(
    text: string,
    onEnd?: () => void,
    onError?: (err?: any) => void,
    onStart?: () => void
  ): void {
    if (!this.synth) {
      onError?.(new Error('مرورگر شما از خروجی صوتی پشتیبانی نمی‌کند.'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    // Search for Persian voice
    const voices = this.synth.getVoices();
    const faVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('fa') ||
        v.lang.toLowerCase().includes('ir') ||
        v.name.toLowerCase().includes('persian') ||
        v.name.toLowerCase().includes('farsi')
    );

    if (faVoice) {
      utterance.voice = faVoice;
    }

    utterance.lang = 'fa-IR';
    utterance.rate = this.speechRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Native TTS error:', e);
      this.currentUtterance = null;
      onError?.(e);
    };

    this.synth.speak(utterance);
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
