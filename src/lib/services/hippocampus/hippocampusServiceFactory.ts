/**
 * Factory for creating instances of the HippocampusService.
 * 
 * This factory allows for different implementations to be used in different environments:
 * - MockHippocampusService for testing
 * - HippocampusServiceImpl for production
 */

import type { HippocampusService } from './hippocampusService';
import { HippocampusServiceImpl } from './hippocampusServiceImpl';
import { MockHippocampusService } from './mockHippocampusService';

let instance: HippocampusService | null = null;

/**
 * Creates or returns an existing instance of the HippocampusService
 * @param useMock - Whether to use a mock implementation (for testing)
 * @returns A HippocampusService implementation
 */
export function getHippocampusService(useMock = false): HippocampusService {
  if (!instance) {
    instance = useMock 
      ? new MockHippocampusService() 
      : new HippocampusServiceImpl();
  }
  return instance;
}

/**
 * Resets the singleton instance, primarily used for testing
 */
export function resetHippocampusService(): void {
  instance = null;
} 