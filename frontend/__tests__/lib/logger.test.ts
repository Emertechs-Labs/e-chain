import { logger, measurePerformance, logError } from '@/lib/logger';

describe('Logger', () => {
  let consoleDebugSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('debug', () => {
    it('logs debug messages in development', () => {
      process.env.NODE_ENV = 'development';
      
      logger.debug('Test debug message', { key: 'value' });
      
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[DEBUG] Test debug message',
        { key: 'value' }
      );
    });

    it('does not log debug messages in production', () => {
      process.env.NODE_ENV = 'production';
      
      logger.debug('Test debug message');
      
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('logs info messages', () => {
      logger.info('Test info message', { data: 'test' });
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[INFO] Test info message',
        { data: 'test' }
      );
    });
  });

  describe('warn', () => {
    it('logs warning messages', () => {
      logger.warn('Test warning', { warning: 'data' });
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[WARN] Test warning',
        { warning: 'data' }
      );
    });
  });

  describe('error', () => {
    it('logs error messages with Error object', () => {
      const error = new Error('Test error');
      
      logger.error('Error occurred', error, { context: 'test' });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR] Error occurred',
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Test error',
            name: 'Error',
          }),
          context: 'test',
        })
      );
    });

    it('logs error messages with non-Error object', () => {
      logger.error('Error occurred', 'string error');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR] Error occurred',
        expect.objectContaining({
          error: 'string error',
        })
      );
    });

    it('always logs errors even in production', () => {
      process.env.NODE_ENV = 'production';
      
      logger.error('Production error');
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('transaction', () => {
    it('logs transaction data', () => {
      logger.transaction('Transaction sent', {
        txHash: '0x123',
        status: 'pending',
      });
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[INFO] Transaction: Transaction sent',
        expect.objectContaining({
          txHash: '0x123',
          status: 'pending',
        })
      );
    });
  });

  describe('contract', () => {
    it('logs successful contract calls', () => {
      logger.contract('mintTicket', {
        contract: '0xABC',
        result: 'success',
      });
      
      expect(consoleDebugSpy).toHaveBeenCalled();
    });

    it('logs failed contract calls as errors', () => {
      const error = new Error('Contract call failed');
      
      logger.contract('mintTicket', {
        contract: '0xABC',
        error,
      });
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('api', () => {
    it('logs successful API calls', () => {
      logger.api('/api/events', {
        method: 'GET',
        status: 200,
      });
      
      expect(consoleDebugSpy).toHaveBeenCalled();
    });

    it('logs failed API calls as errors', () => {
      logger.api('/api/events', {
        method: 'POST',
        status: 500,
        error: new Error('API error'),
      });
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('performance', () => {
    it('logs performance measurements in development', () => {
      process.env.NODE_ENV = 'development';
      
      logger.performance('Component render', 150);
      
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[DEBUG] Performance: Component render took 150ms',
        undefined
      );
    });
  });

  describe('userAction', () => {
    it('logs user actions', () => {
      logger.userAction('Button clicked', { button: 'submit' });
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[INFO] User action: Button clicked',
        { button: 'submit' }
      );
    });
  });
});

describe('measurePerformance', () => {
  it('measures synchronous function performance', () => {
    const fn = jest.fn(() => 'result');
    
    const result = measurePerformance('test-sync', fn);
    
    expect(result).toBe('result');
    expect(fn).toHaveBeenCalled();
  });

  it('measures asynchronous function performance', async () => {
    const fn = jest.fn(async () => 'async-result');
    
    const result = await measurePerformance('test-async', fn);
    
    expect(result).toBe('async-result');
    expect(fn).toHaveBeenCalled();
  });
});

describe('logError', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs Error objects', () => {
    const error = new Error('Test error');
    
    logError('Error message', error, { context: 'test' });
    
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('logs non-Error objects as Error', () => {
    logError('Error message', 'string error');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[ERROR] Error message',
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'string error',
        }),
      })
    );
  });
});
