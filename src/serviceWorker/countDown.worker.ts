/* eslint-disable @typescript-eslint/no-explicit-any */
const TIMER_TICK = "TIMER_TICK";

const timers = new Map<string, number>();

self.addEventListener("message", (event: MessageEvent) => {
  const { type, endAt, observerId } = event.data;

  if (type === "START_TIMER") {
    if (timers.has(observerId)) {
      clearInterval(timers.get(observerId)!);
    }
    // force tick
    const remainingSeconds = calculateRemainingSeconds(new Date(endAt));
    console.log(">>> SW:force tick:remainingSeconds", remainingSeconds);
    (self as any).clients.matchAll().then((clients: any) => {
      clients.forEach((client) => {
        client.postMessage({
          type: TIMER_TICK,
          remainingSeconds,
          observerId,
        });
      });
    });

    const timerId = setInterval(() => {
      const remainingSeconds = calculateRemainingSeconds(new Date(endAt));
      console.log(">>> SW:tick:remainingSeconds", remainingSeconds);
      (self as any).clients.matchAll().then((clients: any) => {
        clients.forEach((client) => {
          client.postMessage({
            type: TIMER_TICK,
            remainingSeconds,
            observerId,
          });
        });
      });

      if (remainingSeconds <= 0) {
        clearInterval(timerId);
        timers.delete(observerId);
      }
    }, 1000);

    timers.set(observerId, timerId);
  }

  if (type === "STOP_TIMER") {
    const timerId = timers.get(observerId);
    if (timerId) {
      clearInterval(timerId);
      timers.delete(observerId);
    }
  }
});

function calculateRemainingSeconds(endAt: Date): number {
  const now = new Date();
  const diff = Math.round((endAt.getTime() - now.getTime()) / 1000) * 1000;
  return Math.max(0, Math.floor(diff / 1000));
}
