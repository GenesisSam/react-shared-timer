// ExampleComponent.tsx
import React from "react";
import { useCountDown } from "./useCountDown";

const ExampleComponent: React.FC = () => {
  const refTimerId = React.useRef<string>();
  const [state, setState] = React.useState<string>();
  const [seconds, setSeconds] = React.useState(0);
  const { create, start, stop, subscribe } = useCountDown();

  const handleStart = () => {
    const startAt = new Date();
    const endAt = new Date();
    endAt.setMinutes(endAt.getMinutes() + 5); // 5분 카운트다운
    const timerId = create(startAt, endAt);
    refTimerId.current = timerId;

    subscribe(timerId, ({ remainingSeconds, status }) => {
      setSeconds(remainingSeconds);
      setState(status);
    });

    start(timerId);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleStop = () => {
    if (refTimerId.current) {
      stop(refTimerId.current);
    }
  };

  React.useEffect(
    () => () => {
      if (refTimerId.current) {
        stop(refTimerId.current);
      }
    },
    []
  );

  return (
    <div>
      <h2>Countdown Timer</h2>
      {state === "running" && (
        <div>
          <p>Remaining Time: {formatTime(seconds)}</p>
        </div>
      )}
      <button onClick={handleStart}>Start 5min Countdown</button>
      <button onClick={handleStop}>Stop</button>
    </div>
  );
};

export default ExampleComponent;
