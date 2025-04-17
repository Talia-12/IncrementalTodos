import { warn, debug, trace, info, error, attachConsole } from '@tauri-apps/plugin-log';

/**
 * Configuration options for the logging system
 */
export interface LoggingOptions {
  /** Whether to attach the console to the Tauri log plugin */
  attachConsole?: boolean;
  /** Whether to forward console methods to the Tauri log plugin */
  forwardConsole?: boolean;
}

/**
 * Checks if the application is running in a Tauri environment
 * @returns Boolean indicating if Tauri is available
 */
function isTauriAvailable(): boolean {
  return typeof window !== 'undefined' && 
         '__TAURI_INTERNALS__' in window;
}

/**
 * Initializes logging by forwarding all console methods to the Tauri log plugin.
 * This ensures that all console messages are captured by the log plugin for
 * centralized logging.
 * 
 * In non-Tauri environments (like browser development), this will use standard 
 * console methods instead.
 * 
 * @param options - Configuration options for logging
 * @returns A promise that resolves when logging is initialized
 */
export async function initializeLogging(options: LoggingOptions = {}): Promise<void> {
  const { 
    attachConsole: shouldAttachConsole = true,
    forwardConsole: shouldForwardConsole = true 
  } = options;
  
  try {
    // Check if we're in a Tauri environment
    if (!isTauriAvailable()) {
      console.info('Tauri environment not detected. Using standard console logging.');
      return;
    }
    
    // Attach the console to the Tauri log plugin if requested
    if (shouldAttachConsole) {
      await attachConsole();
    }
    
    // Forward console methods to the Tauri log plugin if requested
    if (shouldForwardConsole) {
      forwardConsole('log', trace);
      forwardConsole('debug', debug);
      forwardConsole('info', info);
      forwardConsole('warn', warn);
      forwardConsole('error', error);
    }
    
    console.info('Logging initialized: Console messages are now forwarded to the log plugin');
  } catch (err) {
    console.error('Failed to initialize logging:', err);
  }
}

/**
 * Forwards console methods to the corresponding Tauri log plugin methods.
 * 
 * @param fnName - The console method name to forward
 * @param logger - The Tauri log plugin method to forward to
 */
function forwardConsole(
  fnName: 'log' | 'debug' | 'info' | 'warn' | 'error',
  logger: (message: string) => Promise<void>
) {
  const original = console[fnName];
  console[fnName] = (...args) => {
    // Call the original console method
    original(...args);
    
    // Convert all arguments to a string for the logger
    const message = args
      .map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      )
      .join(' ');
    
    // Call the Tauri logger
    logger(message).catch(err => {
      original(`Error forwarding to logger: ${err}`);
    });
  };
} 