type LogEntry = {
  time: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
};

let buffer: LogEntry[] = [];
const MAX = 200;

export function addLog(level: LogEntry['level'], message: string, data?: any) {
  const entry: LogEntry = { time: new Date().toISOString(), level, message, data };
  buffer.push(entry);
  if (buffer.length > MAX) buffer = buffer.slice(buffer.length - MAX);
  try {
    // Lazy import to avoid circular deps at module init
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { realtime } = require('@/lib/realtime/bus');
    realtime().emit('dev:log', { ...entry });
  } catch {
    // ignore
  }
}

export function getLogs(): LogEntry[] {
  return [...buffer];
}

export function clearLogs() {
  buffer = [];
}

