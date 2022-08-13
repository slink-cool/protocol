import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testTimeout: 60000,
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
};
export default config;
