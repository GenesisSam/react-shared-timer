import React from "react";
import CountDownManager from "./countDownManager";

const SecondApp = () => {
  const [remainingSeconds, setSeconds] = React.useState(0);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <div>
        Second timer
        <div>
          <p>Remaining Time: {formatTime(remainingSeconds)}</p>
        </div>
      </div>
      <div>
        <button
          onClick={() => {
            const obs = CountDownManager.getInstance().listObservers();
            if (obs.length > 0) {
              CountDownManager.getInstance().subscribe(
                obs[obs.length - 1],
                (state) => {
                  const { remainingSeconds } = state;
                  setSeconds(remainingSeconds);
                }
              );
            }
          }}
        >
          lets sub
        </button>
      </div>
    </div>
  );
};

export default SecondApp;
