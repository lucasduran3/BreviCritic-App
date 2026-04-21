import type { Config } from 'jest';
import { createDefaultEsmPreset } from 'ts-jest';


export default {
  ...createDefaultEsmPreset(),
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
} satisfies Config;