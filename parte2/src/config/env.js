
const BASE_URL = 'https://facephi.com';
const DEFAULT_TIMEOUT = 20000;
 

module.exports = {
  BASE_URL,
  DEFAULT_TIMEOUT,
  SELENIUM_BROWSER: process.env.SELENIUM_BROWSER || 'chrome',
};
