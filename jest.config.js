module.exports = {
  coverageDirectory: '__coverage__',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  collectCoverageFrom: [
    '<rootDir>/src/**',
    '!<rootDir>/src/**/__snapshots__/**',
    '!<rootDir>/src/server.js',
  ],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/lib'],
};
