const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

async function createDriver() {
  // 1) Servicio usando el binario de chromedriver que instala el paquete npm
  const service = new chrome.ServiceBuilder(chromedriver.path);

  // 2) Opciones de Chrome
  const options = new chrome.Options();
  // Si quieres que NO se vea la ventana, descomenta la siguiente línea:
  // options.addArguments('--headless=new', '--window-size=1280,800');

  // 3) Construimos el driver
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .setChromeService(service)
    .build();

  return driver;
}

module.exports = { createDriver };
