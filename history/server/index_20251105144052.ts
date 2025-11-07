import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { webhookRouter } from './routes/webhook';
import { scrapingRouter } from './routes/scraping';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' })); // Support large payloads with base64 images
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Routes
app.use('/api', webhookRouter);
app.use('/api', scrapingRouter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Webhook API available at http://localhost:${PORT}/api/send-webhook`);
  console.log(`🌐 Scraping API available at http://localhost:${PORT}/api/scrape-and-create-parcours`);
  console.log(`🔧 Scraping Service URL: ${process.env.SCRAPING_SERVICE_URL || 'http://localhost:8000'}`);
  console.log(`💚 Health check at http://localhost:${PORT}/health`);
});

