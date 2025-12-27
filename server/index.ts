import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { webhookRouter } from './routes/webhook';
import { scrapingRouter } from './routes/scraping';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '500mb' })); // Support large payloads with base64 images
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Serve static files from dist folder (production build)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// API Routes
app.use('/api', webhookRouter);
app.use('/api', scrapingRouter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes (SPA support)
app.use((req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Global error handler (must be last)
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Webhook API available at http://localhost:${PORT}/api/send-webhook`);
  console.log(`🌐 Scraping API available at http://localhost:${PORT}/api/scrape-and-create-parcours`);
  console.log(`🔧 Scraping Service URL: ${process.env.SCRAPING_SERVICE_URL || 'http://localhost:8000'}`);
  console.log(`💚 Health check at http://localhost:${PORT}/health`);
});

// Increase timeout to 10 minutes for large requests
server.timeout = 600000; // 10 minutes in milliseconds
server.keepAliveTimeout = 610000; // Slightly longer than timeout
server.headersTimeout = 620000; // Slightly longer than keepAliveTimeout

