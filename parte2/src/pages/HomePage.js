// src/pages/HomePage.js
const { By, until } = require('selenium-webdriver');
const { BASE_URL, DEFAULT_TIMEOUT } = require('../config/env');
const BasePage = require('./BasePage');  

// Selectores del Home
const HOME_SELECTORS = {
  cookieAcceptButton: '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
  cookieRejectButton: '#CybotCookiebotDialogBodyButtonDecline',
  contactButton: "//a[contains(text(),'Contacta')]",
};

class HomePage extends BasePage {  
  constructor(driver) {
    super(driver); 
  }

  async open() {
    await this.driver.get(BASE_URL);
    await this.driver.manage().window().maximize();
  }

  async aceptarCookiesSiAparecen() {
    const selector = HOME_SELECTORS.cookieAcceptButton;
    if (!selector) return;

    try {
      const button = await this.driver.wait(
        until.elementLocated(By.css(selector)),
        3000
      );
      await this.driver.wait(until.elementIsVisible(button), 5000);
      await button.click();
      console.log('Cookies aceptadas.');
    } catch (error) {
      console.log('No apareció el banner de cookies, continuamos.');
    }
  }

  async irAContacto() {
    const selector = HOME_SELECTORS.contactButton;
    if (!selector) {
      throw new Error(
        'HOME_SELECTORS.contactButton no está definido. Rellénalo con el locator real.'
      );
    }

    const buttonContacto = await this.driver.wait(
      until.elementLocated(By.xpath(selector)),
      DEFAULT_TIMEOUT
    );

    await this.driver.wait(until.elementIsVisible(buttonContacto), DEFAULT_TIMEOUT);
    await this.driver.wait(until.elementIsEnabled(buttonContacto), DEFAULT_TIMEOUT);

    // De momento mantenemos el click via JS porque te funciona
    await this.driver.executeScript("arguments[0].click();", buttonContacto);
  }
}

module.exports = HomePage;
