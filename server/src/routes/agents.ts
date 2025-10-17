import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const agentRouter = Router();

agentRouter.get('/', requireAuth, async (_req, res) => {
  const agents = await prisma.agent.findMany({ orderBy: { name: 'asc' } });
  res.json({ agents });
});

// List chat sessions for current user (optionally by agent)
agentRouter.get('/sessions', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const agentId = typeof req.query.agentId === 'string' ? req.query.agentId : undefined;
  const where = agentId ? { userId, agentId } : { userId };
  const sessions = await prisma.chatSession.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: { id: true, agentId: true, createdAt: true },
  });
  res.json({ sessions });
});

// Get chat history by sessionId
agentRouter.get('/history', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId : undefined;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
  const session = await prisma.chatSession.findFirst({ where: { id: sessionId, userId } });
  if (!session) return res.status(404).json({ error: 'Session not found' });
  const history = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ sessionId, history });
});

const messageSchema = z.object({
  agentId: z.string().uuid(),
  sessionId: z.string().uuid().optional(),
  message: z.string().min(1),
});

agentRouter.post('/chat', requireAuth, async (req: AuthRequest, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { agentId, sessionId, message } = parsed.data;
  const userId = req.userId!;

  // Ensure agent exists
  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  let session = sessionId
    ? await prisma.chatSession.findFirst({ where: { id: sessionId, userId, agentId } })
    : null;
  if (!session) {
    session = await prisma.chatSession.create({ data: { userId, agentId } });
  }

  await prisma.chatMessage.create({
    data: { sessionId: session.id, role: 'user', content: message },
  });

  // Build conversation for OpenAI
  let reply = '';
  try {
    const history = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });
    const messages = [
      { role: 'system' as const, content: agent.system },
      ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ];
    if (!process.env.OPENAI_API_KEY) {
      reply = `(${agent.name}) ${message}`;
    } else {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        temperature: 0.3,
      });
      reply = completion.choices[0]?.message?.content || '';
    }
  } catch (e) {
    reply = 'Sorry, there was an error generating a response.';
  }

  await prisma.chatMessage.create({
    data: { sessionId: session.id, role: 'assistant', content: reply },
  });

  const fullHistory = await prisma.chatMessage.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: 'asc' },
  });

  res.json({ sessionId: session.id, reply, history: fullHistory });
});
