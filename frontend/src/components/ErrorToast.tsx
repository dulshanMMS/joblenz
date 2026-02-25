import { useEffect, useRef, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface ErrorToastProps {
  message: string;
  duration?: number; // ms, default 5000
  onDismiss: () => void;
}

export default function ErrorToast({
  message,
  duration = 5000,
  onDismiss,
}: ErrorToastProps) {
  const [visible, setVisible] = useState(true);
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    setVisible(true);
    const hide = setTimeout(() => setVisible(false), duration);
    const remove = setTimeout(() => dismissRef.current(), duration + 300);
    return () => {
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, [message, duration]);

  function close() {
    setVisible(false);
    setTimeout(() => dismissRef.current(), 300);
  }

  return (
    <div
      className={`mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 overflow-hidden transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
      }`}
    >
      {/* Message row */}
      <div className="flex items-start justify-between gap-2 px-4 py-3">
        <span>{message}</span>
        <button
          onClick={close}
          className="shrink-0 text-red-400/50 hover:text-red-400 transition-colors"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Countdown bar */}
      <div className="h-0.5 bg-red-500/10">
        <div
          className="h-full bg-red-500/50 origin-left"
          style={{ animation: `jl-shrink ${duration}ms linear forwards` }}
        />
      </div>
    </div>
  );
}
