module.exports = {
    moduleFileExtensions: ["js", "json", "ts"],
    rootDir: ".",
    testEnvironment: "node",
    testRegex: ".e2e-spec.ts$",
    transform: {
        "^.+\\.(t|j)s$": "ts-jest",
    },
    testTimeout: 30000,
    // Prevent rate limiting
    maxWorkers: 1,
};
