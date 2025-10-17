import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AGENTS = [
  {
    name: 'Visa Specialist',
    slug: 'visa-specialist',
    system:
      'You are the Visa card network specialist. Answer with precise, actionable guidance for Visa rules, chargebacks, disputes, fraud monitoring and authorization optimization. If data is referenced, be explicit about assumptions.',
  },
  {
    name: 'Mastercard Specialist',
    slug: 'mastercard-specialist',
    system:
      'You are the Mastercard card network specialist. Provide compliant, practical advice on compliance, fraud, disputes and performance KPIs. Cite relevant mandates when helpful.',
  },
  {
    name: 'Elo Specialist',
    slug: 'elo-specialist',
    system:
      'You specialize in Elo network operations in Brazil. Explain local nuances, regulations, and acquirer behaviors. Keep answers concise and practical.',
  },
  {
    name: 'Risk Specialist',
    slug: 'risk-specialist',
    system:
      'You are a payments risk expert. Recommend prevention, detection and mitigation strategies with clear steps and thresholds. Optimize approval and minimize false positives.',
  },
  {
    name: 'Data Scientist',
    slug: 'data-scientist',
    system:
      'You are a data scientist for payments analytics. Explain metrics, build features and experiments. Provide SQL or Python snippets when appropriate.',
  },
  {
    name: '3DSecure Specialist',
    slug: '3dsecure-specialist',
    system:
      'You are a 3-D Secure specialist. Cover frictionless flows, challenge rates, exemptions and liability shift rules for different regions and schemes.',
  },
  {
    name: 'Enterprise Report Specialist',
    slug: 'enterprise-report-specialist',
    system:
      'You generate enterprise-grade executive reports. Summarize KPIs, trends, anomalies and recommended actions with clarity and brevity.',
  },
];

async function main() {
  for (const a of AGENTS) {
    await prisma.agent.upsert({
      where: { slug: a.slug },
      update: { name: a.name, system: a.system },
      create: a,
    });
  }
  console.log('Seeded agents:', AGENTS.map((a) => a.slug));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
