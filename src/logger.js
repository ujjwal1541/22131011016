// Custom logging middleware for the URL Shortener app
// Usage: import logger from './logger'; logger.log('message');

const logger = {
  log: (message, ...args) => {
    // You can extend this to log to localStorage, a file, or a server if needed
    // For now, we'll just store logs in localStorage for demonstration
    const logs = JSON.parse(localStorage.getItem('logs') || '[]');
    logs.push({
      timestamp: new Date().toISOString(),
      message: typeof message === 'string' ? message : JSON.stringify(message),
      args,
    });
    localStorage.setItem('logs', JSON.stringify(logs));
  },
  getLogs: () => {
    return JSON.parse(localStorage.getItem('logs') || '[]');
  },
  clear: () => {
    localStorage.removeItem('logs');
  }
};

export default logger; 