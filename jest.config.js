module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: [
    'ts',
    'js',
    'json',
    'node',
  ],
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.tsx?$',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/infra/database/seeds/*.ts',
    '!src/infra/database/migrations/*.ts'
  ],
  setupFilesAfterEnv: ['./test/setup.ts']
};
