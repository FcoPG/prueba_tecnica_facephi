Feature: Formulario de contacto de Facephi
  Como visitante de la web de Facephi
  Quiero poder acceder a la sección de contacto
  Para enviar una consulta a la empresa

  @exito
  Scenario: Enviar el formulario de contacto correctamente
    Given que estoy en la página de inicio de Facephi
    When navego a la sección de contacto
    And relleno el formulario con datos válidos
    And envío el formulario
    Then debería ver un mensaje de confirmación o que el formulario se ha enviado correctamente

  @error
  Scenario: Intentar enviar el formulario sin rellenar campos obligatorios
    Given que estoy en la página de inicio de Facephi
    When navego a la sección de contacto
    And intento enviar el formulario sin rellenar un campo obligatorio
    Then debería ver mensajes de error indicando que faltan datos requeridos

