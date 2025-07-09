<p align="center">
  <img src="https://github.com/user-attachments/assets/caacc234-69fe-4ca0-9844-256bdce61f07" height=250 alt="favicon" />
</p>

<p align="center">
  <a href="https://angular.io/">
    <img src="https://img.shields.io/badge/Angular-19-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular 19" />
  </a>
  <a href="https://ionicframework.com/">
    <img src="https://img.shields.io/badge/Ionic-8-3880FF?style=for-the-badge&logo=ionic&logoColor=white" alt="Ionic 8" />
  </a>
  <a href="https://capacitorjs.com/">
    <img src="https://img.shields.io/badge/Capacitor-7-3578E5?style=for-the-badge&logo=capacitor&logoColor=white" alt="Capacitor 7" />
  </a>
  <a href="https://www.primefaces.org/primeng/">
    <img src="https://img.shields.io/badge/PrimeNG-19-0071C5?style=for-the-badge&logo=primeng&logoColor=white" alt="PrimeNG" />
  </a>
  <a href="https://www.chartjs.org/">
    <img src="https://img.shields.io/badge/Chart.js-4-FF6384?style=for-the-badge&logo=chart.js&logoColor=white" alt="Chart.js" />
  </a>
  <a href="https://www.npmjs.com/package/rxjs">
    <img src="https://img.shields.io/badge/RxJS-7-B7178C?style=for-the-badge&logo=reactivex&logoColor=white" alt="RxJS" />
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/TailwindCSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  </a>
  <a href="https://jestjs.io/">
    <img src="https://img.shields.io/badge/Jest-29-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" />
  </a>
  <a href="https://www.cypress.io/">
    <img src="https://img.shields.io/badge/Cypress-14-17202C?style=for-the-badge&logo=cypress&logoColor=white" alt="Cypress" />
  </a>
  <a href="https://docs.qameta.io/allure/">
    <img src="https://img.shields.io/badge/Allure-3-8C1D40?style=for-the-badge&logo=allure&logoColor=white" alt="Allure Reports" />
  </a>
</p>


# ⚖️ Vita Weight

Vita Weight es una aplicación de seguimiento y análisis de peso, orientada a todo tipo de usuarios, principiantes y avanzados.
Permite al usuario registrar su peso diario, visualizar su historial de pesos, ver su índice de masa corporal, y obtener recomendaciones para lograr sus metas. 
Con el objetivo de fomentar hábitos de vida saludables y sostenibles.
<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/version-0.7.0-blue.svg" alt="version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/build-passing-brightgreen.svg" alt="build"/></a>
</p>

<p align="center">
<img src="https://github.com/user-attachments/assets/5e936c7c-ebe6-49f0-a965-3edea2d03cfe" height=100/>
</p>


<p align="center">
  <img
    src="https://img.shields.io/badge/Author-Giovanni%20Le%C3%B3n-blue?style=for-the-badge"
    alt="Autor: Giovanni León"
  />
</p>




<br>

## 📑 Tabla de Contenidos

- 🛠️ [Funcionalidades clave](#funcionalidades-clave)
- 🎁 [Beneficios para el usuario](#beneficios-para-el-usuario) 
- 📦 [Instalación](#instalación)
- 🚀 [Despliegue](#despliegue) 
  - 🏗️ [Compilación y ejecución](#compilación-y-ejecución)
  - ▶️ [Uso](#uso)
- 🧰 [Herramientas](#herramientas)
- 💻 [Tecnologías utilizadas](#tecnologías-utilizadas)

<br>

## Funcionalidades clave

- Registro diario de peso 📝: Anota tu peso en segundos y con gráficas de fácil lectura.
- Cálculo de IMC 📊: Basado en la clasificación de la OMS para interpretar tu Índice de Masa Corporal.
- Historial y tendencias 📈: Visualiza tu evolución diaria, semanal y mensual con gráficos interactivos.
- Metas inteligentes 🎯: Define plazos realistas y recibe consejos consejos para alcanzarla.
- Exportación de datos 📤: Genera informes en CSV para compartir con profesionales de la salud.

## Beneficios para el usuario

* Autonomía y control: todo el progreso al alcance de la mano.
* Decisiones informadas: guía basada en estándares internacionales de salud.
* Motivación continua: notificaciones y refuerzos positivos en cada hito.
  
## Instalación

Descargue la última versión de la aplicación para android desde la [página de descargas](https://github.com/DevGiovanniLC/TFT-APP/releases/tag/0.7.0)

<br>

## Despliegue

### Compilación y ejecución

**Pre-requisitos:**  
- Android Studio  
- Node.js  

Requisitos para compilar y ejecutar la aplicación:

1. Clona este repositorio:
    ```sh
   git clone https://github.com/DevGiovanniLC/TFT-APP.git
   cd TFT-APP
    ```
2. Instala las dependencias:
    ```sh
    npm install
    ```
    
### Uso

* Visualizar en el navegador en modo desarrollo:
    ```sh
    npm run dev
    ```
* Compilar y abrir en Android Studio:
    ```sh
    npm run android
    ```
* Pruebas unitarias de servicios con jest:
    ```sh
    npm test
    ```
* Pruebas e2e con cypress (UI/UX):
    ```sh
    npm run test:e2e
    ```

<br>

## Herramientas

- **`npm run lint`**  
  Ejecuta el linter de Angular para analizar y corregir problemas de estilo y calidad en el código fuente usando ESLint.

- **`npm run format`**  
  Formatea automáticamente todos los archivos TypeScript, HTML, CSS, SCSS y JSON en la carpeta `src` usando Prettier.

- **`npm run allure:generate`**  
  Genera el reporte de pruebas Allure a partir de los resultados y lo abre automáticamente en el navegador.

- **`npm run allure:open`**  
  Abre el reporte de Allure generado previamente para visualizar los resultados de las pruebas.

- **`npm run sonar`**  
    Ejecuta el analisis del sonar, necesario configurar primero el servidor de sonar cube.

<br>

## Tecnologías utilizadas


* Angular 19 y Ionic 8 para la interfaz de usuario moderna y responsiva.
* Capacitor 7 para integración nativa en Android.
* PrimeNG y Chart.js para visualización avanzada de datos.
* RxJS para programación reactiva.
* TailwindCSS para estilos rápidos y personalizables.
* Jest y Cypress para pruebas unitarias y end-to-end.
* Allure para reportes de pruebas automáticos.
