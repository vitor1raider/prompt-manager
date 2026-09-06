import { test, type Page } from '@playwright/test';

test('should display the home page', async ({ page }: { page: Page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Selecione um Prompt' })
  ).toBeVisible();
  await expect(
    page.getByText(
      'Escolha um prompt da lista ao lado para visualizar e editar'
    )
  ).toBeVisible();
});
