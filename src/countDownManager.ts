export type ObserverCallback = (state: CountDownState) => void;

export type CountDownStatus = "scheduled" | "running" | "timeout" | "stopped";

export interface CountDownState {
  startAt: Date;
  endAt: Date;
  remainingSeconds: number;
  status: CountDownStatus;
}

class CountDownManager {
  private static instance: CountDownManager;
  private observers: Map<string, ObserverCallback[]> = new Map();
  private observerIdCounter: number = 0;
  private states: Map<string, CountDownState> = new Map();
  private _worker: ServiceWorker | null = null;
  public get worker(): ServiceWorker | null {
    return this._worker;
  }
  public set worker(value: ServiceWorker | null) {
    this._worker = value;
  }

  private constructor() {
    this.initializeServiceWorker();
  }

  private async initializeServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        if (import.meta.env.DEV) {
          const registration = await navigator.serviceWorker.getRegistration();
          this.worker = registration.active;
        } else {
          const registration = await navigator.serviceWorker.register(
            "./countDown.worker.js"
          );
          this.worker = registration.active;
        }

        navigator.serviceWorker.addEventListener("message", (event) => {
          const { type, remainingSeconds, observerId } = event.data;
          if (type === "TIMER_TICK" && observerId) {
            console.log(">>>>>> TICK:recv", remainingSeconds);
            const state = this.states.get(observerId);
            if (state) {
              state.remainingSeconds = remainingSeconds;
              if (state.remainingSeconds <= 0) {
                state.status = "timeout";
              }
              this.notifyObserver(observerId);
            }
          }
        });
      } catch (error) {
        console.error("ServiceWorker registration failed:", error);
      }
    }
  }

  static getInstance(): CountDownManager {
    if (!CountDownManager.instance) {
      CountDownManager.instance = new CountDownManager();
    }
    return CountDownManager.instance;
  }

  create(startAt: Date, endAt: Date): string {
    const observerId = this.generateObserverId();
    const end = this.calculateRemainingSeconds(endAt);
    console.log(">>>>>> create", end);
    const state: CountDownState = {
      startAt,
      endAt,
      remainingSeconds: end,
      status: "scheduled",
    };

    this.states.set(observerId, state);

    return observerId;
  }

  start(observerId: string): void {
    const state = this.states.get(observerId);
    if (state && state.status === "scheduled") {
      navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage({
          type: "START_TIMER",
          endAt: state.endAt.valueOf(),
          observerId,
        });
        state.status = "running";
        this.notifyObserver(observerId);
      });
    }
  }

  stop(observerId: string): void {
    const state = this.states.get(observerId);
    if (state) {
      state.status = "stopped";
      this.notifyObserver(observerId);
    }

    navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({
        type: "STOP_TIMER",
        observerId,
      });
    });
  }

  subscribe(
    id: string,
    callback: ObserverCallback
  ): {
    unsubscribe: () => void;
  } {
    const callbacks = this.observers.get(id) ?? [];
    callbacks.push(callback);
    this.observers.set(id, callbacks);

    return {
      unsubscribe: () => this.unsubscribe(id, callback),
    };
  }

  unsubscribe(id: string, callback?: ObserverCallback): void {
    if (!callback) {
      this.observers.delete(id);
      return;
    }

    const callbacks = this.observers.get(id);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        this.observers.delete(id);
      } else {
        this.observers.set(id, callbacks);
      }
    }
  }

  listObservers() {
    return Array.from(this.observers.keys());
  }

  private notifyObserver(observerId: string): void {
    const callbacks = this.observers.get(observerId);
    const state = this.states.get(observerId);
    if (callbacks && state) {
      callbacks.forEach((callback) => callback(state));
    }
  }

  private generateObserverId(): string {
    return `observer_${++this.observerIdCounter}`;
  }

  private calculateRemainingSeconds(endAt: Date): number {
    const now = new Date();
    const diff = endAt.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / 1000));
  }

  getState(observerId: string): CountDownState | null {
    return this.states.get(observerId) ?? null;
  }
}

export default CountDownManager;
