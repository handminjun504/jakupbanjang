import { test, expect } from '@playwright/test';

test.describe('로그인 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('로그인 페이지가 정상적으로 로드된다', async ({ page }) => {
    await expect(page).toHaveTitle(/작업반장/);
    await expect(page.locator('h1').filter({ hasText: '로그인' })).toBeVisible();
  });

  test('작업반장/관리자 선택 버튼이 표시된다', async ({ page }) => {
    await expect(page.getByText('작업반장')).toBeVisible();
    await expect(page.getByText('관리자')).toBeVisible();
  });

  test('작업반장 선택 시 휴대폰 입력 폼이 표시된다', async ({ page }) => {
    await page.getByText('👷 작업반장').click();
    await expect(page.getByText('휴대폰 번호')).toBeVisible();
    await expect(page.getByText('비밀번호')).toBeVisible();
  });

  test('관리자 선택 시 이메일 입력 폼이 표시된다', async ({ page }) => {
    await page.getByText('👔 관리자').click();
    await expect(page.getByText('이메일')).toBeVisible();
    await expect(page.getByText('비밀번호')).toBeVisible();
  });

  test('회원가입 링크가 작동한다', async ({ page }) => {
    await page.getByText('회원가입').click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('콘솔 에러가 없다', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.waitForLoadState('networkidle');
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });
});

test.describe('회원가입 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('회원가입 페이지가 정상적으로 로드된다', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /회원가입/ })).toBeVisible();
  });

  test('작업반장/관리자 선택 버튼이 표시된다', async ({ page }) => {
    await expect(page.getByText('작업반장')).toBeVisible();
    await expect(page.getByText('관리자')).toBeVisible();
  });

  test('관리자 선택 시 이메일, 비밀번호, 기업명 입력 폼이 표시된다', async ({ page }) => {
    await page.getByText('👔 관리자').click();
    await expect(page.getByText('이메일')).toBeVisible();
    await expect(page.getByText('비밀번호')).toBeVisible();
    await expect(page.getByText('기업명')).toBeVisible();
  });

  test('작업반장 선택 시 이름, 전화번호, 비밀번호, 회사코드 입력 폼이 표시된다', async ({ page }) => {
    await page.getByText('👷 작업반장').click();
    await expect(page.getByLabel('이름')).toBeVisible();
    await expect(page.getByLabel('전화번호')).toBeVisible();
    await expect(page.getByLabel('비밀번호')).toBeVisible();
    await expect(page.getByLabel('회사 코드')).toBeVisible();
  });

  test('로그인 링크가 작동한다', async ({ page }) => {
    await page.getByText('로그인').click();
    await expect(page).toHaveURL(/\/login/);
  });
});
