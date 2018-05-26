module.exports = {
  coverageDirectory: '__coverage__',
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  collectCoverageFrom: [
    '<rootDir>/src/**',
    '!<rootDir>/src/**/__snapshots__/**',
  ],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/lib'],
};
