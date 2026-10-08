import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';




import { errorMiddleware } from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import booksRoutes from './routes/books.routes.js';
import schoolLevelsRoutes from './routes/levels.routes.js';
import subjectsRoutes from './routes/subjects.routes.js';
import learnersRoutes from './routes/learners.routes.js';
import trainersRoutes from './routes/trainers.routes.js';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';

const app = express();

const currentFile =
  fileURLToPath(import.meta.url);

const currentDirectory =
  path.dirname(currentFile);

const uploadsBooksDirectory =
  path.resolve(
    currentDirectory,
    '../uploads/books'
  );

if (
  !fs.existsSync(
    uploadsBooksDirectory
  )
) {
  fs.mkdirSync(
    uploadsBooksDirectory,
    {
      recursive: true
    }
  );
}

app.use(
  '/api/uploads/books',
  express.static(
    uploadsBooksDirectory,
    {
      index: false,
      setHeaders: (res) => {
        res.setHeader(
          'Content-Type',
          'application/pdf'
        );

        res.setHeader(
          'Content-Disposition',
          'inline'
        );
      }
    }
  )
);

// Middleware de sécurité : ajoute des en-têtes HTTP protecteurs.
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

// Middleware CORS : autorise le frontend React à appeler l'API.
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);



app.use(
  express.urlencoded({
    extended: true
  })
);

// Middleware pour parser le JSON des requêtes.
app.use(express.json());

// Logger HTTP : affiche les requêtes dans le terminal en développement.
app.use(morgan('dev'));


app.use(cookieParser());
// Routes publiques de test.
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Schoolbooks API fonctionne'
  });
});

// Routes Metiers.
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/school-levels', schoolLevelsRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/learners', learnersRoutes);
app.use('/api/trainers', trainersRoutes);
app.use('/api/profile', profileRoutes);



app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route introuvable',
      code: 'ROUTE_NOT_FOUND'
    }
  });
});


// Middleware de gestion des erreurs (doit être après les routes).
app.use(errorMiddleware);

export default app;