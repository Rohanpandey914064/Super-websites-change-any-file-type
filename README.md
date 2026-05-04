# ConvertFlow — Universal File Converter 🚀

ConvertFlow is a powerful, modern, and scalable SaaS-style web application designed to handle all your file conversion needs. Whether you're converting PDFs to Word documents, resizing images, or transforming Excel sheets to CSV, ConvertFlow provides a seamless, high-performance experience with a stunning user interface.

## 🌟 Overview

The application is built using a decoupled architecture with a **Next.js** frontend and a **Node.js/Express** backend. It leverages **BullMQ** and **Redis** for asynchronous job processing, ensuring that heavy conversions don't block the main server and providing real-time progress updates.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: [Next.js 14](https://nextjs.org/) (React)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a sleek, responsive design.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for smooth micro-interactions.
- **Icons**: [Lucide React](https://lucide.dev/) for clean, modern iconography.
- **Uploads**: [React Dropzone](https://react-dropzone.js.org/) for intuitive drag-and-drop support.
- **State Management**: React Hooks & Context API.

### **Backend**
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Job Queue**: [BullMQ](https://docs.bullmq.io/) with **Redis** for robust background processing.
- **File Handling**: [Multer](https://github.com/expressjs/multer) for secure multipart/form-data uploads.
- **Security**: [Helmet](https://helmetjs.github.io/) and [Express Rate Limit](https://www.npmjs.com/package/express-rate-limit).

### **Conversion Engines**
- **Images**: [Sharp](https://sharp.pixelplumbing.com/) (High-performance image processing).
- **PDFs**: [pdf-lib](https://pdf-lib.js.org/) and [pdf-parse](https://www.npmjs.com/package/pdf-parse).
- **Documents**: [Mammoth](https://www.npmjs.com/package/mammoth) (DOCX to HTML/Text).
- **Spreadsheets**: [XLSX (SheetJS)](https://sheetjs.com/).
- **Data**: [json2csv](https://www.npmjs.com/package/json2csv) and [csv-parser](https://csv.js.org/parser/).

---

## ✨ Key Features

- **Drag & Drop Interface**: Simple and intuitive file uploading.
- **Asynchronous Processing**: Files are processed in the background, allowing the user to continue using the app.
- **Real-time Status**: Tracking the conversion progress via backend job events.
- **Security First**: Rate limiting, file size restrictions, and helmet integration.
- **Automatic Cleanup**: A dedicated cron job automatically deletes temporary files (uploads and converted files) every 30 minutes to preserve disk space.
- **Format Support**:
  - Image to Image (JPG, PNG, WebP)
  - PDF to Text / Image
  - DOCX to HTML / Text
  - Excel to CSV / JSON

---

## 📁 Project Structure

```bash
├── frontend/             # Next.js Application
│   ├── src/app           # Routes and Layouts
│   ├── components/       # Reusable UI components
│   └── styles/           # Global styles and Tailwind config
├── backend/              # Express API Server
│   ├── services/         # Core conversion logic & Workers
│   ├── routes/           # API Endpoints
│   ├── uploads/          # Temporary storage for source files
│   └── converted/        # Storage for processed files
└── .env                  # Environment configurations
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Redis Server** (Local or Cloud instance)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env` (Create a `.env` file based on the provided template).
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📄 License

This project is licensed under the MIT License.
