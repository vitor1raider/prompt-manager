import { expect, test } from '@playwright/test';

test('should open and close the mobile menu', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');

  const openButton = page.getByLabel('Abrir menu');
  const aside = page.getByRole('complementary');
  await expect(openButton).toBeVisible();
  await expect(openButton).toHaveAttribute('aria-expanded', 'false');
  await expect(aside).toHaveCSS('width', '0px');

  await openButton.click();
  await expect(openButton).toHaveAttribute('aria-expanded', 'true');
  await expect(aside).toBeInViewport();
  await expect(aside).toHaveCSS('width', '300px');
  const closeButton = page.getByLabel('Fechar menu');
  await expect(closeButton).toBeInViewport();
  await expect(page.getByPlaceholder('Pesquisar prompts')).toBeInViewport();

  await page.getByRole('button', { name: 'Minimizar menu' }).click();
  await expect(openButton).toHaveAttribute('aria-expanded', 'true');
  await expect(aside).toHaveCSS('width', '72px');

  await page.getByRole('button', { name: 'Expandir menu' }).click();
  await expect(aside).toHaveCSS('width', '300px');

  await closeButton.click();
  await expect(openButton).toHaveAttribute('aria-expanded', 'false');
  await expect(aside).toHaveCSS('width', '0px');
  await expect(page.getByLabel('Fechar menu')).not.toBeInViewport();
  await expect(page.getByPlaceholder('Pesquisar prompts')).not.toBeInViewport();
});

test('mobile: should close the collapsed menu when creating a prompt', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');

  const openButton = page.getByLabel('Abrir menu');
  const aside = page.getByRole('complementary');

  await openButton.click();
  await page.getByRole('button', { name: 'Minimizar menu' }).click();
  await expect(aside).toHaveCSS('width', '72px');

  await page.getByRole('button', { name: 'Novo Prompt' }).click();

  await expect(page).toHaveURL(/\/new$/);
  await expect(openButton).toHaveAttribute('aria-expanded', 'false');
  await expect(aside).toHaveCSS('width', '0px');
});

test('desktop: menu hambúrguer deve estar oculto e conteúdo deve estar visível', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto('/');

  await expect(page.getByLabel('Abrir menu')).toBeHidden();
  await expect(page.getByPlaceholder('Pesquisar prompts')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Minimizar menu' })
  ).toBeVisible();
  await expect(page.getByLabel('Fechar menu')).toBeHidden();
  await expect(
    page.getByRole('heading', { name: 'Selecione um prompt ' })
  ).toBeVisible();
});
