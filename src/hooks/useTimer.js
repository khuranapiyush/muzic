import { useState, useEffect, useRef } from 'react';

const useTimer = (initialSeconds = 60, config = { autoStart: true }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resumeTimer = () => {
    setIsRunning(true);
  };

  const resetTimer = () => {
    setSeconds(initialSeconds);
    setIsRunning(true);
  };

  useEffect(() => {
    if (config.autoStart) {
      startTimer();
    }
  }, [config.autoStart]);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsRunning(false);
    }

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isRunning, seconds]);

  return {
    seconds,
    isRunning,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
  };
};

export default useTimer;
