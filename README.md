# Finbook — Personal Finance with Precision

![Finbook Banner](https://raw.githubusercontent.com/diegoledesma/assets/main/finbook-banner.png) <!-- Note: Replace with actual banner URL -->

**Finbook** is a premium, desktop-based personal finance management application designed for those who value both minimal aesthetics and powerful analytical capabilities. Built with a focus on simplicity, security, and data persistence.

Developed and Owned by **Diego Ledesma**.

---

## 🖤 The Monochromatic Aesthetic

Finbook breaks away from the colorful, noisy interfaces of traditional finance apps. It features a strictly **monochromatic, premium visual design** that reduces cognitive load and allows you to focus purely on your numbers. 

- **State-of-the-art UI**: Sleek dark/light transitions and pill-shaped interactive elements.
- **Minimalist Reports**: High-contrast charts that highlight trends without the distraction of red/green indicators.

---

## 🚀 Key Features

### 📅 Intelligent Monthly Persistence
Never lose track of your recurring obligations. Finbook automatically rolls over **Fixed Expenses** and **Fixed Income** to each new month, while providing a "Fresh Start" for one-time transactions.
- **Smart Logic**: Non-recurring items stay in their respective months to maintain history accuracy.
- **Manual Control**: Credit card installments are handled with a "Control-First" approach, giving the user full manual power over their tracking.

### 📊 Advanced Financial Tracking
- **Unified Dashboard**: A high-level overview of your monthly performance, goal progress, and recent activity.
- **Custom Categorization**: Create and manage personal categories (e.g., employee names, specific projects) to tailor the app to your specific lifecycle.
- **Savings Goals**: Milestone-based tracking for your long-term financial objectives.
- **Integrated Checklist**: Keep track of financial tasks or shopping lists directly within the platform.

### 🔒 Privacy & Security (Local-First)
- **Zero Cloud**: Your financial data never leaves your machine. 
- **SQLite Powered**: A robust local database ensures your records are permanent, searchable, and secure.

---

## 🛠️ Technological Stack

- **Framework**: Electron (Desktop Integration)
- **Frontend**: React.js + TypeScript
- **Styling**: Vanilla CSS (Tailwind CSS for utility)
- **Database**: SQLite3
- **Build Tool**: Vite

---

## 📋 Getting Started

### Prerequisites
- Node.js (v18 or superior)
- npm

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/[your-username]/finbook.git
   cd finbook
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run in development**:
   ```bash
   npm run dev
   ```

---

## 🏗️ Distribution

To package the application for your operating system:

```bash
# Windows
npm run dist:win

# Linux
npm run dist:linux
```

---

## 🤝 Contributing & License

### Source Available License
Finbook is a **Source Available** project. All intellectual property rights belong solely to **Diego Ledesma**.
- **Personal Use**: You are free to use and modify the code for personal use.
- **Redistribution**: Prohibited. You may not redistribution clones or derivative versions of Finbook.
- **Contributions**: Pull Requests are welcome! By contributing, you agree that Diego Ledesma retains ownership of the merged code.

---

Created with ❤️ by **Diego Ledesma**.
💰 *Manage your finances with the elegance they deserve.*