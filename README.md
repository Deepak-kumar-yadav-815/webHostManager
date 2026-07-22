<div align="center">
  
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/activity.svg" alt="Logo" width="80" height="80">

# Web Host Manager (WHM)

  **A Next-Generation, Real-Time Cloud Hosting Platform with AI-Powered Analytics.**

  [![React](https://img.shields.io/badge/React-19.0-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
  [![Vite](https://img.shields.io/badge/Vite-Lightning_Fast-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
  [![Gemini API](https://img.shields.io/badge/Gemini_AI-Insights-FF6F00.svg?style=for-the-badge&logo=google)](https://ai.google.dev/)
  
</div>

---

## 🌟 Overview

**Web Host Manager (WHM)** is a sleek, modern, and highly interactive platform that allows users to upload, host, and monitor their static web applications. Designed with a premium **glassmorphic UI**, WHM goes beyond traditional hosting by offering **real-time resource telemetry**, integrated **user feedback collection**, and cutting-edge **AI-driven UX insights**.

Whether you are a developer deploying a single landing page or an admin monitoring server fleets, WHM provides a stunning, cohesive experience.

---

## ✨ Key Features

### 🚀 Seamless Deployment

- **Repository Management**: Upload plain `.html` files which are securely stored and served via Cloudinary.
- **One-Click Hosting**: Queue, deploy, and unhost "server nodes" instantly with custom domain slugs.
- **Injected Feedback Widget**: Hosted sites automatically receive an unobtrusive widget, allowing end-users to leave ratings and comments directly on the live page!

### 📊 Real-Time Telemetry

- **Live Resource Graphs**: Built with `Recharts` and `Socket.io`, watch your active visitors, CPU usage, and RAM consumption update by the second.
- **Global Analytics**: An interactive Admin Dashboard tracks platform-wide signups and active node deployments over time.

### 🧠 AI Code & UX Insights

- Powered by the **Google Gemini API**.
- WHM reads the specific source code of your hosted node alongside the actual user feedback collected from the widget.
- Generates a customized, actionable report with code recommendations and growth strategies formatted beautifully in Markdown.
- **Smart Caching**: API responses are cached in MongoDB to save tokens, with a manual refresh option.

### 💳 Subscriptions & Billing

- **Tiered Plans**: Users can subscribe to various hosting plans with dynamic website limits.
- **PDF Invoices**: Automatically generates and downloads beautiful PDF invoices using `jspdf`.

### 🎨 Stunning UI/UX

- **Glassmorphism**: A frosted-glass design language across the entire application.
- **Dynamic Theming**: Full Dark/Light mode support with customizable accent color palettes (Ocean Blue, Emerald, Amethyst, Amber, Rose).
- **Smooth Animations**: Micro-interactions, slide-ups, and fade-ins that make the dashboard feel alive.

---

## 🛠️ Technology Stack

### Frontend

- **React 19** & **Vite**: Lightning-fast UI rendering and development server.
- **Clerk Auth**: Secure, passwordless, and multi-provider authentication.
- **Vanilla CSS**: Hand-crafted CSS variables for absolute control over the dynamic design system (No Tailwind used).
- **Recharts**: For beautiful, responsive data visualization.
- **React Markdown**: For rendering AI insights.
- **Lucide React**: Clean, modern iconography.

### Backend

- **Node.js & Express**: Robust RESTful API architecture.
- **MongoDB & Mongoose**: Flexible document database for users, plans, invoices, and analytics.
- **Socket.io**: Bidirectional event-based communication for live metrics.
- **Cloudinary**: High-performance blob storage for HTML files.
- **Google GenAI (Gemini)**: For generating intelligent code insights.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB URI
- Cloudinary Account
- Clerk API Keys
- Google Gemini API Key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/webHostManager.git
   cd webHostManager
   ```

2. **Setup the Backend**

   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the `backend` directory:

   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLERK_SECRET_KEY=your_clerk_secret
   JWT_SECRET=your_admin_jwt_secret
   AI_API_KEY=your_gemini_api_key
   ```

   Run the backend:

   ```bash
   npm start
   ```

3. **Setup the Frontend**

   ```bash
   cd ../frontend
   npm install
   ```

   Create a `.env` file in the `frontend` directory:

   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

   Run the frontend:

   ```bash
   npm run dev
   ```

4. **Access the App**
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Authentication Flow

WHM utilizes **Clerk** for all public frontend authentication. However, the Admin Dashboard uses a secure, localized JWT strategy to ensure that internal platform settings remain strictly controlled by the system administrators.

---

## 📸 Screenshots

*(Add screenshots of your Glassmorphic Dashboard, Telemetry Charts, and AI Insights Modal here to WOW your visitors!)*

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](#).

## 📝 License

This project is licensed under the MIT License.

---
<div align="center">
  <i>Crafted with ❤️ for modern web developers.</i>
</div>
