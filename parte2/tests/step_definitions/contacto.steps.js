const { defineFeature, loadFeature } = require('jest-cucumber');
const { createDriver } = require('../../src/support/driverFactory');
const HomePage = require('../../src/pages/HomePage');
const ContactPage = require('../../src/pages/ContactPage');

jest.setTimeout(60000); // 60s por si hay retrasos

//Importamos datos desde fixtures
const fs = require("fs");
const path = require("path");
let contactoData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../fixtures/contactoData.json"))
);

let contactoDataError = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../fixtures/contactoDataError.json"))
);

const feature = loadFeature('tests/features/contacto.feature');

defineFeature(feature, (test) => {
  let driver;
  let homePage;
  let contactPage;

  beforeAll(async () => {
    driver = await createDriver(); 
    homePage = new HomePage(driver);
    contactPage = new ContactPage(driver);
  }, 30000);

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('Enviar el formulario de contacto correctamente', ({ given, when, and, then }) => {
    given('que estoy en la página de inicio de Facephi', async () => {
      await homePage.open();
      await homePage.aceptarCookiesSiAparecen();
    });

    when('navego a la sección de contacto', async () => {
    await homePage.irAContacto();

    // Comprobar que la URL es la de Contacta
    await contactPage.comprobarUrlEsContacto();

    //Comprobar el titulo de Contacta 
    const titulo = await contactPage.obtenerTitulo();
    expect(titulo).toBe('Contacta con Facephi')

    });

    and('relleno el formulario con datos válidos', async () => {
      await contactPage.rellenarFormulario(contactoData);
    });

    and('envío el formulario', async () => {
      await contactPage.enviarFormulario();
    });

    then(
      'debería ver un mensaje de confirmación o que el formulario se ha enviado correctamente',
      async () => {
        const mensaje = await contactPage.obtenerMensajeConfirmacion();
        //Comprobar texto confirmacion      
        expect(mensaje).toContain("En breve, nos pondremos en contacto contigo");
      }
    );
  });

  test('Intentar enviar el formulario sin rellenar campos obligatorios', ({ given, when, and, then }) => {
    given('que estoy en la página de inicio de Facephi', async () => {
      await homePage.open();
      await homePage.aceptarCookiesSiAparecen();
    });

    when('navego a la sección de contacto', async () => {
      await homePage.irAContacto();
      await contactPage.comprobarUrlEsContacto();
    });

    and('intento enviar el formulario sin rellenar un campo obligatorio', async () => {
      // Usamos los datos de error (empresa vacía) del fixture
      await contactPage.rellenarFormulario(contactoDataError);
      await contactPage.enviarFormulario();
      }
    );
    
    then('debería ver mensajes de error indicando que faltan datos requeridos', async () => {
        const mensajeError = await contactPage.obtenerMensajeError();
        // Comprobamos que aparece el bloque de error general…
        expect(mensajeError).toContain('Hubo un problema con tu envío. Por favor, revisa los siguientes campos.');
        // …y el detalle concreto del campo Empresa
        expect(mensajeError).toContain('Empresa: Este campo es obligatorio.');
        }
      );
    }
  );

});
