import { test, expect } from '@playwright/test'

test.describe('首页第一屏推荐菜 - E2E 验收测试', () => {
  test('REQ-001.1: 首页展示推荐菜模块，含 4 道菜品卡片', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/#\/home$/)
    // 推荐菜模块标题可见
    await expect(page.getByRole('heading', { name: '今日推荐' })).toBeVisible()
    // 推荐菜提示文案可见
    await expect(page.getByText('点击即可入桌点餐')).toBeVisible()
    // 4 道菜品卡片（带 ¥ 价格的 aria-label 按钮）
    const recommendCards = page.locator('button[aria-label*="¥"]')
    await expect(recommendCards).toHaveCount(4)
  })

  test('REQ-001.3: 每张卡片展示菜品名称、价格和徽标', async ({ page }) => {
    await page.goto('/')
    // p1: 鎏金番茄鸳鸯锅 ¥68 人气 No.1
    await expect(page.getByRole('button', { name: /鎏金番茄鸳鸯锅/ })).toBeVisible()
    await expect(page.getByText('人气 No.1')).toBeVisible()
    // p2: 牛油麻辣锅 ¥59 招牌
    await expect(page.getByRole('button', { name: /牛油麻辣锅/ })).toBeVisible()
    await expect(page.getByText('招牌')).toBeVisible()
    // p3: 琥珀嫩牛肉 ¥42 主厨推荐
    await expect(page.getByRole('button', { name: /琥珀嫩牛肉/ })).toBeVisible()
    await expect(page.getByText('主厨推荐')).toBeVisible()
    // p5: 鲜虾滑 ¥39 新品
    await expect(page.getByRole('button', { name: /鲜虾滑/ })).toBeVisible()
    await expect(page.getByText('新品')).toBeVisible()
  })

  test('REQ-001.4: 推荐菜模块首屏可见（不需滚动）', async ({ page }) => {
    await page.goto('/')
    // 推荐菜标题在视口内
    const title = page.getByRole('heading', { name: '今日推荐' })
    await expect(title).toBeInViewport()
    // 首张菜品卡片也在视口内
    const firstCard = page.getByRole('button', { name: /鎏金番茄鸳鸯锅/ })
    await expect(firstCard).toBeInViewport()
  })

  test('REQ-002.1+002.3: 点击推荐菜卡片自动绑桌并跳转 #/menu', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /鎏金番茄鸳鸯锅/ }).click()
    await expect(page).toHaveURL(/#\/menu$/)
  })

  test('REQ-002.2: 跳转后默认选中"推荐"分类', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /鎏金番茄鸳鸯锅/ }).click()
    await expect(page).toHaveURL(/#\/menu$/)
    // "推荐"分类按钮被选中（bg-chili-500）
    const recommendTab = page.getByRole('button', { name: '推荐', exact: true })
    await expect(recommendTab).toHaveClass(/bg-chili-500/)
  })

  test('REQ-002.4: 点击推荐菜卡片不弹出规格选择窗', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /鎏金番茄鸳鸯锅/ }).click()
    await expect(page).toHaveURL(/#\/menu$/)
    // 不应出现规格选择弹窗中的"加入本桌购物车"按钮
    await expect(page.getByRole('button', { name: '加入本桌购物车' })).not.toBeVisible()
  })

  test('REQ-002.1: 点击第二张推荐菜卡片同样跳转菜单', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /牛油麻辣锅/ }).click()
    await expect(page).toHaveURL(/#\/menu$/)
  })
})
