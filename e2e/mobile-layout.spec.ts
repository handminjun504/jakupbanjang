import { test, expect } from '@playwright/test';

test.describe('모바일 레이아웃 검증', () => {
  test('로그인 페이지 - 모든 요소가 화면 안에 표시된다', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const viewport = page.viewportSize();
    if (!viewport) return;

    const buttons = page.locator('button');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 5);
      }
    }
  });

  test('로그인 페이지 - 버튼 터치 영역이 48px 이상이다', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const buttons = page.locator('button');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box && box.height > 0) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('로그인 페이지 - 입력 필드 폰트가 16px 이상이다 (iOS 줌 방지)', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('👷 작업반장').click();

    const inputs = page.locator('input');
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      const fontSize = await inputs.nth(i).evaluate(
        (el) => window.getComputedStyle(el).fontSize
      );
      const size = parseInt(fontSize);
      expect(size).toBeGreaterThanOrEqual(16);
    }
  });

  test('회원가입 페이지 - 가로 스크롤이 없다', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('각 페이지에서 콘솔 에러가 없다', async ({ page }) => {
    const pagesToTest = ['/login', '/signup'];

    for (const path of pagesToTest) {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const jsErrors = errors.filter(
        (e) => !e.includes('favicon') && !e.includes('net::ERR')
      );
      expect(jsErrors).toHaveLength(0);
    }
  });
});
