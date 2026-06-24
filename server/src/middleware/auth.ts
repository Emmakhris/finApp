import { Request, Response, NextFunction } from 'express';

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const key = process.env.API_KEY;
  if (!key) {
    res.status(500).json({ error: 'API_KEY not configured on server' });
    return;
  }
  if (!header || header !== `Bearer ${key}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
