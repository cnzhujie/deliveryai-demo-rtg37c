import { test, expect, type Page } from '@playwright/test'

/** 从首页绑定 A08 桌台并进入点餐视图（menu）。 */
async function enterMenu(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: /A08/ }).first().click() // home → welcome
  await page.getByRole('button', { name: /进入点餐|Enter/ }).click() // welcome → menu
}

/** 检查页面是否存在水平滚动条（横向溢出）。 */
async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth
  })
  expect(hasOverflow).toBeFalsy()
}

test.describe('移动端适配 - E2E 验收测试', () => {
  test('E2E-001: 移动端主流程 — 绑定桌台、进入菜单、浏览/搜索菜品、切换分类', async ({ page }) => {
    await enterMenu(page)

    // 页面正常渲染，菜品可见
    await expect(page.getByRole('heading', { name: '鎏金番茄鸳鸯锅' })).toBeVisible()

    // 切换分类 — 锅底
    await page.getByRole('button', { name: '锅底' }).click()
    await expect(page.getByRole('heading', { name: '鎏金番茄鸳鸯锅' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '牛油麻辣锅' })).toBeVisible()

    // 切换分类 — 肉类
    await page.getByRole('button', { name: '牛羊肉' }).click()

    // 搜索菜品
    await page.getByPlaceholder(/搜索|Search/).fill('牛')
    // 搜索结果应包含含「牛」的菜品
    await expect(page.locator('article').first()).toBeVisible()
  })

  test('E2E-002: 移动端底部导航栏可切换视图 (menu ↔ order)', async ({ page }) => {
    await enterMenu(page)

    // 底部导航栏可见（lg:hidden 在移动端视口下可见）
    const bottomNav = page.locator('nav').last()
    await expect(bottomNav).toBeVisible()

    // 点击底部导航「订单」切换到订单视图
    await page.getByRole('button', { name: /订单|Orders/ }).last().click()
    await expect(page).toHaveURL(/#\/order$/)

    // 点击底部导航「点餐」切换回菜单视图
    await page.getByRole('button', { name: /点餐|Menu/ }).last().click()
    await expect(page).toHaveURL(/#\/menu$/)
  })

  test('E2E-003: 移动端浮动购物车按钮可见且可点击打开购物车弹窗', async ({ page }) => {
    await enterMenu(page)

    // 浮动购物车按钮初始不可见（购物车为空）
    await expect(page.getByRole('button', { name: /查看购物车|View Cart/ })).not.toBeVisible()

    // 打开规格选择弹窗并加入购物车
    await page.getByRole('button', { name: '锅底' }).click()
    await page.locator('article').first().locator('button').last().click()
    await page.getByRole('button', { name: /加入本桌购物车|Add to Cart/ }).click()

    // 浮动购物车按钮出现
    const cartBtn = page.getByRole('button', { name: /查看购物车|View Cart/ })
    await expect(cartBtn).toBeVisible()

    // 点击浮动购物车按钮打开购物车弹窗
    await cartBtn.click()
    await expect(page.getByRole('dialog').getByText('本桌购物车').first()).toBeVisible()
  })

  test('E2E-004: 移动端菜单页无水平滚动条（360px 视口无溢出）', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await enterMenu(page)

    await expectNoHorizontalOverflow(page)

    // 切换分类后仍无溢出
    await page.getByRole('button', { name: '锅底' }).click()
    await expectNoHorizontalOverflow(page)

    await page.getByRole('button', { name: '牛羊肉' }).click()
    await expectNoHorizontalOverflow(page)
  })

  test('E2E-005: 移动端 TopBar 隐藏服务呼叫和演示控制台按钮（由底部导航提供入口）', async ({ page }) => {
    await enterMenu(page)

    // TopBar 中被标记为 hidden 的按钮在移动端不可见
    // 服务呼叫和演示控制台按钮添加了 hidden lg:inline-flex，移动端应隐藏
    const hiddenButtons = await page.locator('header button.hidden').count()
    expect(hiddenButtons).toBeGreaterThanOrEqual(2)

    // 这些隐藏按钮在移动端视口下不可见
    const hiddenBtn = page.locator('header button.hidden').first()
    await expect(hiddenBtn).not.toBeVisible()
  })
})
