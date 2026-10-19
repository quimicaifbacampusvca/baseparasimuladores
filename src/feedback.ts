namespace BaseDemoSI {
  /** Feedback universal: sem dados de domínio, mídias remotas ou áudio automático. */
  export type FeedbackEvent = "success" | "warning" | "info";
  let soundEnabled = false;
  let vibrationEnabled = false;
  let audio: AudioContext | null = null;
  type AudioCtor = new () => AudioContext;
  function findAudioCtor(): AudioCtor | null {
    const browser = window as Window & { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
    if (typeof browser.AudioContext === "function") return browser.AudioContext;
    return typeof browser.webkitAudioContext === "function" ? browser.webkitAudioContext : null;
  }
  export function feedbackCapabilities(): { sound: boolean; vibration: boolean } {
    return { sound: !!findAudioCtor(), vibration: typeof navigator.vibrate === "function" };
  }
  export function configureFeedback(sound: boolean, vibration: boolean): void {
    soundEnabled = sound === true;
    vibrationEnabled = vibration === true;
  }
  export function currentFeedback(): { sound: boolean; vibration: boolean } {
    return { sound: soundEnabled, vibration: vibrationEnabled };
  }
  /** Não emite sinais até que a pessoa habilite a preferência explicitamente. */
  export function signalFeedback(event: FeedbackEvent): void {
    const support = feedbackCapabilities();
    if (soundEnabled && support.sound) {
      try {
        const ctor = findAudioCtor();
        if (ctor) {
          audio = audio || new ctor();
          if (audio.state === "suspended") void audio.resume().catch(() => {});
          const oscillator = audio.createOscillator();
          const gain = audio.createGain();
          oscillator.type = "sine";
          oscillator.frequency.value = event === "success" ? 580 : event === "warning" ? 295 : 440;
          const now = audio.currentTime;
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
          oscillator.connect(gain).connect(audio.destination);
          oscillator.start(now);
          oscillator.stop(now + 0.2);
        }
      } catch { /* A preferência continua ativa; o dispositivo pode bloquear áudio. */ }
    }
    if (vibrationEnabled && support.vibration) {
      try { navigator.vibrate(event === "warning" ? [65, 35, 65] : 55); }
      catch { /* Nem todo sistema operacional autoriza vibração. */ }
    }
  }
}
