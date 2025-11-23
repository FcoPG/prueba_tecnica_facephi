const BasePage = require('./BasePage');

const CONTACT_SELECTORS = {
  pageTitle: '.block--bg-white h1.title-block',
  endPointContacta: '/contacta/',

  // selectores formulario
    nombre: "#input_2_1",
    email: "#input_2_4",
    empresa: "#input_2_22",
    pais: "#input_2_6",
    industria: "#input_2_9",
    interes: "#input_2_13",
    consentimiento: "#input_2_12_1",
    btnEnviar: "#gform_submit_button_2",


  //Mensajes de envio
  mensajeConfirmacion: '#gform_confirmation_wrapper_2',
  mensajeError: '#gform_2_validation_container'

};

class ContactPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Comprueba que la URL contiene el fragmento de Contacta
  async comprobarUrlEsContacto() {
    await this.esperarUrlContenga(CONTACT_SELECTORS.endPointContacta);
  }

  async rellenarFormulario(data) {
    await this.escribirTexto(CONTACT_SELECTORS.nombre, data.nombre);
    await this.escribirTexto(CONTACT_SELECTORS.email, data.email);
    await this.escribirTexto(CONTACT_SELECTORS.empresa, data.empresa);
    await this.seleccionarOpcion(CONTACT_SELECTORS.pais, data.pais);
    await this.seleccionarOpcion(CONTACT_SELECTORS.industria, data.industria);
    await this.seleccionarOpcion(CONTACT_SELECTORS.interes, data.interes);

    if (data.acepta) {
      await this.marcarCheckbox(CONTACT_SELECTORS.consentimiento);
      
    }
  }

  async enviarFormulario() {
    await this.clickSeguro(CONTACT_SELECTORS.btnEnviar, 'css');
    await this.driver.sleep(5000);
  }

  async obtenerTitulo() {
    return this.obtenerTexto(CONTACT_SELECTORS.pageTitle, 'css');
  }

  async obtenerMensajeConfirmacion() {
    return this.obtenerTexto(CONTACT_SELECTORS.mensajeConfirmacion, 'css');
  }

  async obtenerMensajeError() {
    return this.obtenerTexto(CONTACT_SELECTORS.mensajeError, 'css');
  }

  async obtenerUrlContacto() {
    return this.obtenerURLActual();
  }

  async obtenerTextoErrores() {
    // Reutilizamos BasePage.obtenerTexto
    await this.esperarVisible(CONTACT_SELECTORS.mensajeError);
    return this.obtenerTexto(CONTACT_SELECTORS.mensajeError);
  }

}

module.exports = ContactPage;
