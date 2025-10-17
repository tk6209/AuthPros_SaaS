import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const authRouter = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function sign(userId: string) {
  return jwt.sign({}, process.env.JWT_SECRET || 'devsecret', { subject: userId, expiresIn: '7d' });
}

authRouter.post('/register', async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const passwordHash = await argon2.hash(password);
  const user = await prisma.user.create({ data: { email, passwordHash } });
  const token = sign(user.id);
  res.json({ token, user: { id: user.id, email: user.email } });
});

authRouter.post('/login', async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = sign(user.id);
  res.json({ token, user: { id: user.id, email: user.email } });
});
