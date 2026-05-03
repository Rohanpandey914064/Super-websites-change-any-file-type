# ConvertFlow — Universal File Converter

A modern, scalable SaaS-style web application for converting files between various formats. Built with Next.js, Node.js, and BullMQ.

## 🚀 Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express, Multer, BullMQ
- **Queue/Jobs**: Redis
- **Conversion Libraries**: sharp, pdf-lib, mammoth, xlsx, json2csv

## 🛠️ Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Redis](https://redis.io/) (Required for background job processing)

## 📦 Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd super-website-that-change-pdf-to-any-things
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Ensure REDIS_HOST and REDIS_PORT are correct in .env
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

## 📁 Project Structure
- `/frontend`: Next.js application (React components, styles, API integration)
- `/backend`: Express server and routes
- `/backend/services`: Core conversion logic and background workers
- `/uploads`: Temporary storage for uploaded files
- `/converted`: Temporary storage for result files

## 🔒 Security & Privacy
- Files are temporarily stored on the server during conversion.
- An automatic cleanup job (Cron) deletes files older than 30 minutes every 5 minutes.
- Rate limiting is enabled to prevent abuse.
- File size limit is set to 50MB by default.

## 📄 License
MIT
