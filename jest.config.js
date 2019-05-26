module.exports = {
  testEnvironment: 'node',
  transform: {
    '.(ts|tsx)': '<rootDir>/test/preprocessor.js'
  },
  moduleFileExtensions: [
    'ts',
    'js',
    'json',
    'node',
  ],
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.tsx?$',
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
  ],
  setupTestFrameworkScriptFile: './test/setup.ts'
};
