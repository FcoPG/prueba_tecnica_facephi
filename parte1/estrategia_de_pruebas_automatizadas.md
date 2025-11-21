# Propuesta de Estrategia de Pruebas Automatizadas — Widget Biométrico Embebible
**Autor:** Francisco Plaza García  
**Fecha:** Noviembre 2025

## 1. Resumen y Objetivos
El objetivo de esta propuesta es diseñar una estrategia de automatización de pruebas para el widget biométrico embebible de FacePhi. La estrategia se centra en la validación de la integración del widget en un entorno de cliente simulado.

## 2. Entorno Tecnológico
La estrategia se basa en el siguiente stack tecnológico definido:

*   **Lenguaje:** JavaScript / Node.js
*   **Framework de Pruebas:** Jest
*   **Librería de Control del Navegador:** Selenium 4
*   **Ejecución Cross-Browser:** Integración con BrowserStack

## 3. Estructura del Proyecto
La estructura se centra en tres principios: claridad, mantenibilidad y modularidad. Permite separar responsabilidades y escalar la suite a medida que el widget evoluciona.

### 3.1 Organización de Directorios
```
/project-root
├── config/                   → Configuración general (entornos, BrowserStack, Jest)
├── src/
│   ├── pages/                → Page Objects (interacción con UI)
│   ├── utils/                → Helpers (esperas, logs, mocks)
│   └── selectors/            → Selectores centralizados
├── tests/
│   ├── functional/           → Pruebas funcionales del widget
│   ├── integration/          → Validación widget ↔ portal cliente
│   └── regression/           → Regresión crítica / smoke
│
├── fixtures/               # Datos de prueba
│   ├── test-videos/        # Videos simulados de rostro
│   └── mock-responses/     # Respuestas mockeadas 
│
├── reports/                  → Allure / HTML reports
└── package.json
```

### 3.2. Separación de tipos de pruebas

| **Tipo de Test**      | **Ubicación**        | **Objetivo Principal**                                   | **Cobertura**                                   | **Cuándo se ejecuta**              | **Tags**               |
| --------------------- | -------------------- | -------------------------------------------------------- | ----------------------------------------------- | ---------------------------------- | ---------------------- |
| **Funcionales**       | `tests/functional/`  | Validar flujos completos y funcionalidad core del widget | Captura de rostro, validaciones, carga, estados | En cada build y durante desarrollo | `@funcional`           |
| **Integración**       | `tests/integration/` | Validar comunicación widget ↔ host cliente               | Eventos, callbacks, datos transmitidos          | Pull Requests y pre-release        | `@integracion`         |
| **Regresión / Smoke** | `tests/regression/`  | Asegurar que actualizaciones no rompen funcionalidad     | Flujos críticos, smoke tests                    | Antes de cada release y hotfixes   | `@regresion`, `@smoke` |


### 3.3 Estrategia de Localización de Elementos
Para evitar la fragilidad de los tests, se establece una jerarquía de prioridad para la selección de elementos:

| **Prioridad**            | **Tipo de Selector**                                        | **Descripción / Uso recomendado**                                                                       |
| ------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **1️⃣**         | **Atributos de test dedicados**<br>`data-testid`, `data-qa` |  Son la opción preferida, ya que desacoplan los tests de los cambios en el DOM (CSS, JS). Se solicitará al equipo de desarrollo que los añada en elementos clave. |
| **2️⃣**                  | **Roles y atributos ARIA**<br>`role`, `aria-label`          | Son buenos indicadores de la función de un elemento.                                            |
| **3️⃣**                  | **ID y name**                                               | IDs únicos y name para elementos de formulario.                                |
| **4️⃣**                  | **Clases CSS estables**                                     |  Únicamente clases que definan la funcionalidad y no el estilo. Se evitarán clases generadas dinámicamente.                  |
| **5️⃣** | **XPath**                                                   | Como último recurso, y siempre buscando que sea lo más corto y legible posible, evitando rutas absolutas.|

Todos los selectores estarán encapsulados dentro de las clases del **Page Object Model (POM)**, nunca directamente en los tests.

**Ejemplo sugerido POM (`src/pages/WidgetPage.js`):**

```javascript
const { By, until } = require('selenium-webdriver');

class WidgetPage {
  constructor(driver) {
    this.driver = driver;

    // Selectores centralizados (strategy: data-testid)
    this.selectors = {
      container: '[data-testid="widget-container"]',
      captureButton: '[data-testid="capture-button"]',
      statusMessage: '[data-testid="status-message"]',
    };
  }

  async waitForLoad() {
    await this.driver.wait(
      until.elementLocated(By.css(this.selectors.container)),
      10000
    );
  }

  async startCapture() {
    const btn = await this.driver.findElement(
      By.css(this.selectors.captureButton)
    );
    await btn.click();
  }

  async getStatusText() {
    const el = await this.driver.findElement(
      By.css(this.selectors.statusMessage)
    );
    return el.getText();
  }
}

module.exports = WidgetPage;

```

## 4. Ejecución de pruebas

### 4.1. Simulación de Webcam
Este es el mayor desafío técnico.
Teniendo en cuenta que una web usa `getUserMedia()` (WebRTC) para acceder a la cámara:
*   El navegador normalmente muestra un popup de permisos.
*   Si el usuario acepta, `getUserMedia()` devuelve un `MediaStream` real de la cámara.

En un entorno de automatización:
*   No podemos depender de una persona aceptando permisos.
*   No queremos depender de una webcam física conectada.
*   Necesitamos resultados reproducibles entre ejecuciones y entre navegadores.

La estrategia se basa en utilizar los mecanismos nativos de los navegadores y configurándolos también en BrowserStack, que son estables, reproducibles y diseñados específicamente para testing WebRTC.

**En ejecución local (Chrome / Edge / Firefox):**
| **Mecanismo nativo**                                                                                                                                                               | **Descripción**                                                                                                                                | **Uso principal**                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Flags WebRTC oficiales (Chrome / Edge / Chromium)**<br>• `--use-fake-device-for-media-stream`<br>• `--use-fake-ui-for-media-stream`<br>• `--use-file-for-fake-video-capture=...` | • Aceptan permisos automáticamente.<br>• Sustituyen la webcam real por un dispositivo simulado.<br>• Permiten usar un vídeo fijo como entrada. | Ejecutar el flujo biométrico completo de captura facial sin usuario real. |
| **Preferencia interna (Firefox)**<br>• `media.navigator.streams.fake = true`                                                                                                       | • Firefox genera un stream simulado.<br>• No solicita permisos.                                                                                | Validar el flujo de captura e inicialización de cámara sin hardware físico, en local y en sesiones de Firefox en BrowserStack. |


En BrowserStack, estos mecanismos se configuran mediante capabilities del navegador remoto, de modo que las mismas pruebas puedan ejecutarse automáticamente en distintos navegadores y sistemas operativos.





**En ejecución remota (BrowserStack):**

| **Mecanismo nativo**                               | **Descripción**                                                                                                                           | **Uso principal**                                                      |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Capabilities WebRTC en navegadores compatibles** | • Auto-aceptan permisos de cámara.<br>• Simulan el dispositivo cuando es soportado.<br>• Permiten ejecutar el flujo biométrico en remoto. | Validar el flujo biométrico completo en entornos cross-browser remotos cuando la cámara simulada es compatible.        |
| **Ejecución sin stream real (fallback)**           | • En navegadores sin soporte de cámara simulada.<br>• Se validan carga, estados, UI y callbacks.                                          | Garantizar compatibilidad del widget en toda la matriz de navegadores. |


### 4.2. Estrategia de paralelización y reducción del tiempo de ejecución
Para mantener una ejecución rápida sin perder cobertura, la estrategia combina paralelización local con ejecución distribuida en BrowserStack.

Para mantener una ejecución rápida sin perder cobertura, la estrategia combina paralelización local con ejecución distribuida en BrowserStack.

| **Mecanismo**              | **Descripción**                                                                                         | **Uso principal**                                   |
|---------------------------|-----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------|
| **Paralelización con Jest** | • Ejecuta tests en paralelo mediante múltiples workers.<br>• Reduce el tiempo total de ejecución.<br>• Permite dividir la suite en módulos (funcional, integración, regresión).<br>• Workers ajustables según capacidad del entorno CI. | Acelerar la ejecución local y en CI dividiendo la carga. |
| **Ejecución en BrowserStack** | • Cada worker de Jest abre su propia sesión remota.<br>• Permite ejecutar los mismos tests simultáneamente en varios navegadores / SO.<br>• Soporta ejecución masivamente paralela.<br>• Ideal para validación cross-browser. | Ejecutar pruebas en múltiples navegadores y dispositivos. |

Esto ofrece una validación real cross-browser sin aumentar la duración total.

## 5. Buenas prácticas y mantenibilidad
El objetivo es garantizar que la suite siga siendo estable, mantenible y escalable en cada release quincenal del widget biométrico. Las siguientes buenas prácticas permiten minimizar flakiness, reducir tiempo de diagnóstico y mantener un coste de mantenimiento bajo.

### 5.1. Minimización de flakiness
El widget biométrico combina WebRTC, asincronía, eventos del DOM y carga embebida dentro de un entorno cliente. Esto introduce fuentes naturales de inestabilidad si no se abordan de forma explícita.
Para ello se identifican las causas más comunes y sus soluciones asociadas:

| **Causa**               | **Solución**          |
| ----------------------- | ---------------------------------- |
| Elementos no cargados   | Esperas explícitas inteligentes    |
| Timeouts inconsistentes | Timeouts dinámicos según entorno   |
| Race conditions         | Sincronización con eventos del DOM |
| Datos externos          | Mocks y fixtures controlados       |
| Estado compartido       | Aislamiento completo entre tests   |

Este enfoque reduce falsos positivos y garantiza resultados reproducibles entre navegadores y entornos remotos.

### 5.2. Estrategia sostenible de mantenimiento
Dado el ritmo de actualización del widget (cada 2 semanas), la suite debe estar preparada para cambios frecuentes sin requerir grandes refactorizaciones.

Las líneas de mantenimiento propuestas son:
*   **Uso de Page Object Model**: centraliza selectores y acciones, reduciendo duplicación.
*   **Selectores estables (data-testid):** inmunes a cambios visuales o refactor UI.
*   **Estructura modular por tipo de prueba:** funcional, integración y regresión.
*   **Revisión periódica:** limpieza de tests inestables y actualización de selectores.

Este diseño facilita que la suite crezca y evolucione sin aumentar el coste de mantenimiento.

### 5.3. Reportes y métricas
Se integrarán reportes automáticos con Allure Framework o jest-html-reporter, proporcionando una visión clara del estado de calidad del widget tras cada ejecución.

Métricas clave a monitorizar:
| **Métrica**              | **Descripción**                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| **Pass Rate**            | Porcentaje de tests que pasan.                                                            |
| **Duración de la suite** | Detecta cuellos de botella o degradaciones de rendimiento.                                |
| **Tasa de flakiness**    | Tests que requieren reintentos; indicador directo de estabilidad.                         |
| **Reporte de fallos**    | Incluye screenshots, logs del navegador y vídeos de BrowserStack para diagnóstico rápido. |
| **Cobertura funcional**  | Relación entre tests y funcionalidades mediante tags Allure.                              |



Estas métricas permiten detectar problemas de forma temprana, priorizar mejoras y asegurar estabilidad antes de cada release.

### 5.4. Gestión del cambio entre versiones del widget
*   **Regresión mínima obligatoria por release:**  validación de carga, cámara, flujo de captura y callbacks.
*   **Etiquetas de criticidad** (`@critical`, `@smoke`):  para priorizar suites rápidas.
*   **Compatibilidad cross-browser:**  ejecución periódica de la matriz completa de navegadores.
*   **Documentación viva de selectores y eventos del widget:**  siempre alineada con la versión vigente.