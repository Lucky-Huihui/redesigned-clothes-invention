import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import itemRoutes from './routes/items.js';
import outfitRoutes from './routes/outfits.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/outfits', outfitRoutes);

// API 404 fallback
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// Serve frontend static files in production
const distPath = join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`🚀 ClosetMate Server running at http://localhost:${PORT}`);
  console.log(`📦 API: http://localhost:${PORT}/api`);
});
