import express, { Express } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

/**
 * Crea una instancia de Express para tests
 */
export const createTestApp = (): Express => {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  return app;
};

