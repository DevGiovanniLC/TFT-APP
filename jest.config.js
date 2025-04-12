module.exports = {
    testEnvironment: "allure-jest/jsdom",
    testPathIgnorePatterns: [
        '/node_modules/',
        'src/environments/environment.test.ts'
    ],
    preset: "jest-preset-angular",
    roots: ["<rootDir>/src"],
    setupFilesAfterEnv: ["<rootDir>/src/setup-jest.ts"],
    moduleNameMapper: {
        '^@shared/(.*)$': '<rootDir>/src/components/$1',
        '^@core/(.*)$': '<rootDir>/src/app/core/$1',
        '^@models/(.*)$': '<rootDir>/src/models/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@pages/(.*)$': '<rootDir>/src/app/pages/$1',
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@pipes/(.*)$': '<rootDir>/src/pipes/$1',
        '^@plugins/(.*)$': '<rootDir>/src/plugins/$1',
        '^@envs/(.*)$': '<rootDir>/src/environments/$1',
        '^@assets/(.*)$': '<rootDir>/src/assets/$1'
    },
};

