import React from "react";
import CountDownManager, { ObserverCallback } from "./countDownManager";

export const useCountDown = () => {
  const [state, setState] = React.useState<{
    startAt?: Date;
    endAt?: Date;
    remainingSeconds: number;
    status?: "scheduled" | "running" | "timeout" | "stopped";
  }>({ remainingSeconds: 0 });

  const create = React.useCallback((startAt: Date, endAt: Date) => {
    return CountDownManager.getInstance().create(startAt, endAt);
  }, []);

  const start = React.useCallback((observerId: string) => {
    CountDownManager.getInstance().start(observerId);
  }, []);

  const stop = React.useCallback((observerId: string) => {
    CountDownManager.getInstance().stop(observerId);
  }, []);

  const subscribe = React.useCallback(
    (id: string, callback: ObserverCallback) => {
      return CountDownManager.getInstance().subscribe(id, callback);
    },
    []
  );

  const getState = React.useCallback((observerId: string) => {
    const currentState = CountDownManager.getInstance().getState(observerId);
    if (currentState) {
      setState(currentState);
    }
    return currentState;
  }, []);

  return {
    state,
    create,
    start,
    stop,
    subscribe,
    getState,
  };
};
