import { test, expect, type Page } from '@playwright/test'

const MOBILE = { width: 375, height: 812 }

async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
}

test.describe('移动端布局适配', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE)
  })

  test('NFR-101: 点餐页无横向溢出，顶栏操作不超出视口', async ({ page }) => {
    await page.goto('/#/menu')
    await expect(page.getByRole('heading', { name: '鎏金番茄鸳鸯锅' })).toBeVisible()
    await expectNoHorizontalOverflow(page)
    const lang = page.getByRole('button', { name: '切换语言' })
    const box = await lang.boundingBox()
    expect(box && box.x + box.width).toBeLessThanOrEqual(MOBILE.width)
  })

  test('NFR-102: 移动端底部导航可见，顶栏服务/演示入口收起', async ({ page }) => {
    await page.goto('/#/menu')
    await expect(page.getByRole('button', { name: '服务', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '演示', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '呼叫服务' })).toBeHidden()
    await expect(page.getByRole('button', { name: '演示控制台' })).toBeHidden()
  })

  test('NFR-103: 订单页与结账页无横向溢出', async ({ page }) => {
    await page.goto('/#/order')
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible()
    await expectNoHorizontalOverflow(page)
    await page.goto('/#/checkout')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expectNoHorizontalOverflow(page)
  })
})
