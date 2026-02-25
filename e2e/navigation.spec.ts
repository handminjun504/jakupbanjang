import { test, expect } from '@playwright/test';

test.describe('네비게이션', () => {
  test('루트 경로가 로그인 페이지로 리다이렉트된다', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/(login)?$/);
  });

  test('인증되지 않은 사용자가 보호된 페이지에 접근하면 리다이렉트된다', async ({ page }) => {
    await page.goto('/foreman/site-selection');
    await expect(page).toHaveURL(/\/(login)?$/);
  });

  test('인증되지 않은 사용자가 관리자 페이지에 접근하면 리다이렉트된다', async ({ page }) => {
    await page.goto('/manager/dashboard');
    await expect(page).toHaveURL(/\/(login)?$/);
  });

  test('존재하지 않는 페이지가 홈으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await expect(page).toHaveURL(/\//);
  });
});

test.describe('PWA 메타데이터', () => {
  test('manifest.json이 올바르게 로드된다', async ({ page }) => {
    await page.goto('/login');

    const manifest = page.locator('link[rel="manifest"]');
    await expect(manifest).toHaveAttribute('href', /manifest\.json/);
  });

  test('viewport 메타태그가 올바르다', async ({ page }) => {
    await page.goto('/login');

    const viewport = page.locator('meta[name="viewport"]');
    const content = await viewport.getAttribute('content');
    expect(content).toContain('width=device-width');
    expect(content).toContain('initial-scale=1');
  });

  test('테마 색상이 설정되어 있다', async ({ page }) => {
    await page.goto('/login');

    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content', '#FFD644');
  });

  test('apple-mobile-web-app 메타태그가 설정되어 있다', async ({ page }) => {
    await page.goto('/login');

    const capable = page.locator('meta[name="apple-mobile-web-app-capable"]');
    await expect(capable).toHaveAttribute('content', 'yes');

    const title = page.locator('meta[name="apple-mobile-web-app-title"]');
    await expect(title).toHaveAttribute('content', '작업반장');
  });
});
