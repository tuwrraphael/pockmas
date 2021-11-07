const appContext = require.context("../src", true, /\.spec\.ts$/)
const testContext = require.context("../test", true, /\.spec\.ts$/)
appContext.keys().forEach(appContext);
testContext.keys().forEach(testContext);
