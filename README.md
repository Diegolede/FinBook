<div align="center">
  <img src="src/logo.png" alt="Finbook Logo" width="180" />
  <h1>Finbook</h1>
  <p>
    <strong>Tu gestor de finanzas personales definitivo.</strong>
  </p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/Hecho%20con-Arch%20Linux-1793d1?style=for-the-badge&logo=archlinux&logoColor=white" alt="Arch Linux" />
    <img src="https://img.shields.io/badge/Editor-VS%20Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white" alt="VS Code" />
    <img src="https://img.shields.io/badge/IA-Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white" alt="Gemini" />
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  </p>
</div>

---

## Descripción General

**Finbook** es una aplicación de escritorio diseñada para simplificar la gestión de tus finanzas personales. Ofrece un control exhaustivo de ingresos, gastos y metas mensuales, todo bajo una interfaz moderna, rápida y centrada en la privacidad del usuario.

<br>
<div align="center">
  <img src="src/renderer/Finbook-logo.png" alt="Captura de pantalla de Finbook" width="400" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
  <p><em>Organiza tus finanzas con claridad y estilo</em></p>
</div>
<br>

## Funcionalidades

*   **Gestión Integral de Ingresos y Gastos**: Registra tus movimientos financieros de forma categorizada y detallada.
*   **Seguimiento de Metas Mensuales**: Establece objetivos de ahorro y límites de gasto que se mantienen y actualizan mes a mes.
*   **Control de Tarjetas de Crédito**: Administra tus consumos, cuotas y fechas de vencimiento de manera eficiente.
*   **Dashboard Visual e Interactivo**: Visualiza el estado actual de tus finanzas con gráficos y resúmenes automáticos por mes.
*   **Notas y Checklist Integrado**: Mantén tus recordatorios financieros organizados directamente en tu espacio de trabajo.
*   **Persistencia Local y Privacidad**: Todos tus datos se almacenan localmente mediante SQLite, sin necesidad de conexión a la nube.
*   **Multilenguaje**: Soporte completo para Español e Inglés.



## Tecnologías y Dependencias

### Stack Tecnológico
Finbook está construido con tecnologías modernas para garantizar estabilidad y rendimiento:
*   **Core**: [Electron](https://www.electronjs.org/) (Aplicación de escritorio)
*   **Frontend**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
*   **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
*   **Base de Datos**: [SQLite](https://www.sqlite.org/) (Persistencia local)
*   **Gráficos**: [Chart.js](https://www.chartjs.org/) + [Lucide React](https://lucide.dev/)

---

## Requisitos del Sistema (Linux)

Finbook se distribuye como un archivo **AppImage** autocontenido. En la mayoría de los entornos de escritorio modernos, la aplicación funcionará de inmediato.

La única dependencia del sistema que comúnmente requiere instalación manual en distribuciones recientes (como Ubuntu 22.04+ o Fedora 38+) es la biblioteca **FUSE (Filesystem in Userspace)** en su versión 2, necesaria para montar el archivo AppImage.

### Guía de Instalación de FUSE

<details>
<summary><strong>Arch Linux / Manjaro</strong></summary>

```bash
sudo pacman -S fuse2
```
</details>

<details>
<summary><strong>Fedora / CentOS / RHEL</strong></summary>

```bash
sudo dnf install fuse
```
</details>

<details>
<summary><strong>Ubuntu 24.04 / Debian 13 (Trixie) y superiores</strong></summary>

En versiones muy recientes, el paquete ha sido renombrado para gestionar la transición de 64 bits:
```bash
sudo apt update
sudo apt install libfuse2t64
```
</details>

<details>
<summary><strong>Ubuntu 20.04 - 23.10 / Debian 11 - 12</strong></summary>

Para versiones estándar recientes:
```bash
sudo apt update
sudo apt install libfuse2
```
</details>

*Nota: El resto de las bibliotecas gráficas (GTK, ALSA, X11) suelen estar preinstaladas en cualquier distribución orientada al escritorio.*

---

## Descarga e Instalación

Para utilizar Finbook en su sistema:

1.  Diríjase a la sección **[Releases](../../releases)** del repositorio.
2.  Descargue la última versión del archivo `.AppImage` (ej. `Finbook-1.0.0.AppImage`).
3.  Otorgue permisos de ejecución al archivo mediante la terminal:

    ```bash
    chmod +x Finbook-*.AppImage
    ```

4.  Ejecute la aplicación:

    ```bash
    ./Finbook-*.AppImage
    ```

---

<div align="center">
  <p>Desarrollado por <strong>Diego Ledesma</strong></p>
</div>
