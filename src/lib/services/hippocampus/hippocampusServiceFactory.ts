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

let mockInstance: HippocampusService | null = null;
let realInstance: HippocampusService | null = null;

/**
 * Creates or returns an existing instance of the HippocampusService
 * @param useMock - Whether to use a mock implementation (for testing)
 * @returns A HippocampusService implementation
 */
export function getHippocampusService(useMock = false): HippocampusService {
  if (useMock) {
    if (!mockInstance) {
      mockInstance = new MockHippocampusService();
    }
    return mockInstance;
  } else {
    if (!realInstance) {
      realInstance = new HippocampusServiceImpl();
    }
    return realInstance;
  }
}

/**
 * Resets the singleton instances, primarily used for testing
 * @param mockOnly - Whether to reset only the mock instance
 */
export function resetHippocampusService(mockOnly = false): void {
  mockInstance = null;
  if (!mockOnly) {
    realInstance = null;
  }
}