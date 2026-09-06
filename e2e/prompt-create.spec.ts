import test, { expect } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma/client';

test('should create a new prompt UI', async ({ page }) => {
  const uniqueTitle = `E2E Prompt ${Date.now()}`;
  const content = `E2E Prompt Content`;

  await page.goto('/new');
  await expect(page.getByPlaceholder('Título do prompt')).toBeVisible();
  await page.fill('input[name="title"]', uniqueTitle);
  await page.fill('textarea[name="content"]', content);
  await page.getByRole('button', { name: 'Salvar' }).click();

  await page.waitForSelector(`text=Prompt criado com sucesso`, {
    state: 'visible',
    timeout: 15000,
  });
});

test('should not create a new prompt with a duplicate title', async ({
  page,
}) => {
  const duplicateTitle = 'E2E Duplicate Prompt';
  const content = 'E2E Duplicate Prompt Content';

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  await prisma.prompt.deleteMany({ where: { title: duplicateTitle } });
  await prisma.prompt.create({
    data: { title: duplicateTitle, content },
  });
  await prisma.$disconnect();

  await page.goto('/new');
  await expect(page.getByPlaceholder('Título do prompt')).toBeVisible();
  await page.fill('input[name="title"]', duplicateTitle);
  await page.fill('textarea[name="content"]', content);
  await page.getByRole('button', { name: 'Salvar' }).click();

  await page.waitForSelector(`text=Este prompt já existe`, {
    state: 'visible',
    timeout: 15000,
  });

  await expect(page.getByRole('heading', { name: duplicateTitle })).toHaveCount(
    1
  );
});
