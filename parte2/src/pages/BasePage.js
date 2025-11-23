// BasePage.js
const { By, until } = require("selenium-webdriver");
const { DEFAULT_TIMEOUT } = require("../config/env");

class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async esperarVisible(selector, tipo = "css") {
    const by = tipo === "css" ? By.css(selector) : By.xpath(selector);

    const elemento = await this.driver.wait(
        until.elementLocated(by),
        DEFAULT_TIMEOUT
    );

    await this.driver.wait(
        until.elementIsVisible(elemento),
        DEFAULT_TIMEOUT
    );

        return elemento;
  }

  async scrollHaciaElemento(elemento) {
    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block: 'center'});",
      elemento
    );
  }

  async clickSeguro(selector, tipo = "css") {
    const elemento = await this.esperarVisible(selector, tipo);
    await this.scrollHaciaElemento(elemento);
    await this.driver.wait(until.elementIsEnabled(elemento), DEFAULT_TIMEOUT);
    await elemento.click();
  }

  async esperarTextoEnElemento(selector, texto, tipo = "css") {
    const elemento = await this.esperarVisible(selector, tipo);

    await this.driver.wait(async () => {
      const contenido = await elemento.getText();
      return contenido.includes(texto);
    }, DEFAULT_TIMEOUT);

    return true;
  }
  async esperarUrlContenga(fragmento) {
    await this.driver.wait(async () => {
        const url = await this.driver.getCurrentUrl();
        return url.includes(fragmento);
    }, DEFAULT_TIMEOUT);

    return true;
  }

    async escribirTexto(selector, texto, tipo = "css") {
        const input = await this.esperarVisible(selector, tipo);
        await input.clear();
        await input.sendKeys(texto);
    }

    async seleccionarOpcion(selector, valor, tipo = "css") {
        const select = await this.esperarVisible(selector, tipo);
        const option = await select.findElement(By.css(`option[value="${valor}"]`));
        await option.click();
    }

    async marcarCheckbox(selector, tipo = "css") {
        const checkbox = await this.esperarVisible(selector, tipo);
        const selected = await checkbox.isSelected();

        if (!selected) {
            await checkbox.click();
        }
    }

    async obtenerTexto(selector, tipo = 'css') {
        const elemento = await this.esperarVisible(selector, tipo);
        return elemento.getText();
    }

    async obtenerURLActual() {
    return this.driver.getCurrentUrl();
    }

}

module.exports = BasePage;
