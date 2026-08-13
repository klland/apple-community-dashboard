import marketAdjustments from './marketAdjustments.json'
import mikoPriceCeilings from './mikoPriceCeilings.json'
import jyesPriceCeilings from './jyesPriceCeilings.json'

// Apple 產品完整資料庫
export const APPLE_PRODUCTS = [
  // ==================== 2026 新品 ====================
  {
    id: 'iphone-17e',
    name: 'iPhone 17e',
    category: 'iPhone',
    storages: ['256G', '512G'],
    colors: ['黑色', '白色', '嫩粉色'],
    launchDate: '2026-03-11',
    launchPrice: { '256G': 21900, '512G': 28900 },
    basePrice: { '256G': 21900, '512G': 28900 },
    marketAvg: { '256G': 19400, '512G': 26000 },
    tradeInPrice: null,
  },
  {
    id: 'macbook-neo-13',
    name: 'MacBook Neo 13吋',
    category: 'MacBook',
    storages: ['8G/256G'],
    colors: ['胭粉色', '靛青色', '銀色', '橘黃色'],
    launchDate: '2026-03-11',
    launchPrice: { '8G/256G': 19900 },
    basePrice: { '8G/256G': 19900 },
    marketAvg: { '8G/256G': 18000 },
    tradeInPrice: 10700,
  },

  // ==================== iPhone 17 系列 ====================
  {
    id: 'iphone-17-pro-max',
    name: 'iPhone 17 Pro Max',
    category: 'iPhone',
    storages: ['256G', '512G', '1T', '2T'],
    colors: ['宇宙橙色', '藏藍色', '銀色'],
    launchDate: '2025-09-19',
    launchPrice: { '256G': 44900, '512G': 51900, '1T': 58900, '2T': 72900 },
    basePrice: { '256G': 44900, '512G': 51900, '1T': 58900, '2T': 72900 },
    marketAvg: { '256G': 34800, '512G': 41800, '1T': 48800, '2T': 62000 },
    tradeInPrice: null,
  },
  {
    id: 'iphone-17-pro',
    name: 'iPhone 17 Pro',
    category: 'iPhone',
    storages: ['256G', '512G', '1T'],
    colors: ['宇宙橙色', '藏藍色', '銀色'],
    launchDate: '2025-09-19',
    launchPrice: { '256G': 39900, '512G': 46900, '1T': 53900 },
    basePrice: { '256G': 39900, '512G': 46900, '1T': 53900 },
    marketAvg: { '256G': 31300, '512G': 38300, '1T': 45300 },
    tradeInPrice: null,
  },
  {
    id: 'iphone-17-air',
    name: 'iPhone 17 Air',
    category: 'iPhone',
    storages: ['256G', '512G', '1T'],
    colors: ['太空黑色', '雲白色', '淺金色', '天藍色'],
    launchDate: '2025-09-19',
    launchPrice: { '256G': 36900, '512G': 43900, '1T': 50900 },
    basePrice: { '256G': 36900, '512G': 43900, '1T': 50900 },
    marketAvg: { '256G': 30600, '512G': 37000, '1T': 43000 },
    tradeInPrice: null,
  },
  {
    id: 'iphone-17',
    name: 'iPhone 17',
    category: 'iPhone',
    storages: ['256G', '512G'],
    colors: ['薰衣草紫色', '霧藍色', '鼠尾草綠色', '白色', '黑色'],
    launchDate: '2025-09-19',
    launchPrice: { '256G': 29900, '512G': 36900 },
    basePrice: { '256G': 29900, '512G': 36900 },
    marketAvg: { '256G': 23700, '512G': 30700 },
    tradeInPrice: null,
  },

  // ==================== iPhone ====================
  {
    id: 'iphone-16-pro-max',
    name: 'iPhone 16 Pro Max',
    category: 'iPhone',
    storages: ['256G', '512G', '1T'],
    colors: ['黑色鈦', '白色鈦', '原色鈦', '沙漠色鈦'],
    launchDate: '2024-09-20',
    launchPrice: { '256G': 44900, '512G': 51900, '1T': 58900 },
    basePrice: { '256G': 44900, '512G': 51900, '1T': 58900 },
    marketAvg: { '256G': 28000, '512G': 30000, '1T': 36000 },
    tradeInPrice: 23600,
  },
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro',
    category: 'iPhone',
    storages: ['128G', '256G', '512G', '1T'],
    colors: ['黑色鈦', '白色鈦', '原色鈦', '沙漠色鈦'],
    launchDate: '2024-09-20',
    launchPrice: { '128G': 36900, '256G': 40400, '512G': 47400, '1T': 54400 },
    basePrice: { '128G': 36900, '256G': 40400, '512G': 47400, '1T': 54400 },
    marketAvg: { '128G': 23000, '256G': 25000, '512G': 29000, '1T': 33000 },
    tradeInPrice: 20100,
  },
  {
    id: 'iphone-16-plus',
    name: 'iPhone 16 Plus',
    category: 'iPhone',
    storages: ['128G', '256G', '512G'],
    colors: ['黑色', '白色', '粉色', '湖水綠色', '湛海藍色'],
    launchDate: '2024-09-20',
    launchPrice: { '128G': 32900, '256G': 36400, '512G': 43400 },
    basePrice: { '128G': 32900, '256G': 36400, '512G': 43400 },
    marketAvg: { '128G': 19000, '256G': 21000, '512G': 25000 },
    tradeInPrice: 16000,
  },
  {
    id: 'iphone-16',
    name: 'iPhone 16',
    category: 'iPhone',
    storages: ['128G', '256G', '512G'],
    colors: ['黑色', '白色', '粉色', '湖水綠色', '湛海藍色'],
    launchDate: '2024-09-20',
    launchPrice: { '128G': 29900, '256G': 33400, '512G': 40400 },
    basePrice: { '128G': 29900, '256G': 33400, '512G': 40400 },
    marketAvg: { '128G': 16000, '256G': 18000, '512G': 22000 },
    tradeInPrice: 14600,
  },
  {
    id: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max',
    category: 'iPhone',
    storages: ['256G', '512G', '1T'],
    colors: ['黑色鈦', '白色鈦', '藍色鈦', '本然鈦'],
    launchDate: '2023-09-22',
    launchPrice: { '256G': 44900, '512G': 51900, '1T': 58900 },
    basePrice: { '256G': 44900, '512G': 51900, '1T': 58900 },
    marketAvg: { '256G': 20000, '512G': 23000, '1T': 25000 },
    tradeInPrice: 18700,
  },
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    category: 'iPhone',
    storages: ['128G', '256G', '512G', '1T'],
    colors: ['黑色鈦', '白色鈦', '藍色鈦', '本然鈦'],
    launchDate: '2023-09-22',
    launchPrice: { '128G': 36900, '256G': 40400, '512G': 47400, '1T': 54400 },
    basePrice: { '128G': 36900, '256G': 40400, '512G': 47400, '1T': 54400 },
    marketAvg: { '128G': 15000, '256G': 17000, '512G': 20000, '1T': 23000 },
    tradeInPrice: 15400,
  },
  {
    id: 'iphone-15-plus',
    name: 'iPhone 15 Plus',
    category: 'iPhone',
    storages: ['128G', '256G', '512G'],
    colors: ['黑色', '藍色', '綠色', '黃色', '粉紅色'],
    launchDate: '2023-09-22',
    launchPrice: { '128G': 32900, '256G': 36400, '512G': 43400 },
    basePrice: { '128G': 32900, '256G': 36400, '512G': 43400 },
    marketAvg: { '128G': 12000, '256G': 14000, '512G': 17000 },
    tradeInPrice: 12000,
  },
  {
    id: 'iphone-15',
    name: 'iPhone 15',
    category: 'iPhone',
    storages: ['128G', '256G', '512G'],
    colors: ['黑色', '藍色', '綠色', '黃色', '粉紅色'],
    launchDate: '2023-09-22',
    launchPrice: { '128G': 29900, '256G': 33400, '512G': 40400 },
    basePrice: { '128G': 29900, '256G': 33400, '512G': 40400 },
    marketAvg: { '128G': 11000, '256G': 13000, '512G': 16000 },
    tradeInPrice: 11500,
  },
  {
    id: 'iphone-14-pro-max',
    name: 'iPhone 14 Pro Max',
    category: 'iPhone',
    storages: ['128G', '256G', '512G', '1T'],
    colors: ['深紫色', '金色', '銀色', '太空黑色'],
    launchDate: '2022-09-16',
    launchPrice: { '128G': 38900, '256G': 42400, '512G': 49400, '1T': 56400 },
    basePrice: { '128G': 38900, '256G': 42400, '512G': 49400, '1T': 56400 },
    marketAvg: { '128G': 12500, '256G': 14000, '512G': 17000, '1T': 20000 },
    tradeInPrice: 14300,
  },
  {
    id: 'iphone-14-pro',
    name: 'iPhone 14 Pro',
    category: 'iPhone',
    storages: ['128G', '256G', '512G', '1T'],
    colors: ['深紫色', '金色', '銀色', '太空黑色'],
    launchDate: '2022-09-16',
    launchPrice: { '128G': 34900, '256G': 38400, '512G': 45400, '1T': 52400 },
    basePrice: { '128G': 34900, '256G': 38400, '512G': 45400, '1T': 52400 },
    marketAvg: { '128G': 10500, '256G': 12000, '512G': 14500, '1T': 17500 },
    tradeInPrice: 11900,
  },
  {
    id: 'iphone-14-plus',
    name: 'iPhone 14 Plus',
    category: 'iPhone',
    storages: ['128G', '256G', '512G'],
    colors: ['午夜色', '星光色', '藍色', '紫色', '紅色'],
    launchDate: '2022-10-07',
    launchPrice: { '128G': 31900, '256G': 35400, '512G': 42400 },
    basePrice: { '128G': 31900, '256G': 35400, '512G': 42400 },
    marketAvg: { '128G': 8500, '256G': 10000, '512G': 13000 },
    tradeInPrice: 8100,
  },
  {
    id: 'iphone-14',
    name: 'iPhone 14',
    category: 'iPhone',
    storages: ['128G', '256G', '512G'],
    colors: ['午夜色', '星光色', '藍色', '紫色', '紅色'],
    launchDate: '2022-09-16',
    launchPrice: { '128G': 27900, '256G': 31400, '512G': 38400 },
    basePrice: { '128G': 27900, '256G': 31400, '512G': 38400 },
    marketAvg: { '128G': 7500, '256G': 9000, '512G': 11500 },
    tradeInPrice: 8200,
  },
  {
    id: 'iphone-13-pro-max',
    name: 'iPhone 13 Pro Max',
    category: 'iPhone',
    storages: ['128G', '256G', '512G', '1T'],
    colors: ['天峰藍', '金色', '銀色', '石墨色'],
    launchDate: '2021-09-24',
    launchPrice: { '128G': 36900, '256G': 40400, '512G': 47400, '1T': 54400 },
    basePrice: { '128G': 36900, '256G': 40400, '512G': 47400, '1T': 54400 },
    marketAvg: { '128G': 9000, '256G': 10000, '512G': 12000, '1T': 14000 },
    tradeInPrice: 10400,
  },
  {
    id: 'iphone-13-pro',
    name: 'iPhone 13 Pro',
    category: 'iPhone',
    storages: ['128G', '256G', '512G', '1T'],
    colors: ['天峰藍', '金色', '銀色', '石墨色'],
    launchDate: '2021-09-24',
    launchPrice: { '128G': 32900, '256G': 36400, '512G': 43400, '1T': 50400 },
    basePrice: { '128G': 32900, '256G': 36400, '512G': 43400, '1T': 50400 },
    marketAvg: { '128G': 7000, '256G': 8000, '512G': 10000, '1T': 12000 },
    tradeInPrice: 8900,
  },
  {
    id: 'iphone-13',
    name: 'iPhone 13',
    category: 'iPhone',
    storages: ['128G', '256G', '512G'],
    colors: ['午夜色', '星光色', '藍色', '粉紅色', '紅色'],
    launchDate: '2021-09-24',
    launchPrice: { '128G': 25900, '256G': 29400, '512G': 36400 },
    basePrice: { '128G': 25900, '256G': 29400, '512G': 36400 },
    marketAvg: { '128G': 5500, '256G': 6500, '512G': 8000 },
    tradeInPrice: 6400,
  },
  {
    id: 'iphone-se-3',
    name: 'iPhone SE (第3代)',
    category: 'iPhone',
    storages: ['64G', '128G', '256G'],
    colors: ['午夜色', '星光色', '紅色'],
    launchDate: '2022-03-18',
    launchPrice: { '64G': 14900, '128G': 16900, '256G': 20900 },
    basePrice: { '64G': 14900, '128G': 16900, '256G': 20900 },
    marketAvg: { '64G': 5500, '128G': 6500, '256G': 8000 },
    tradeInPrice: 2500,
  },

  // ==================== iPhone 舊機 ====================
  {
    id: 'iphone-12-pro-max',
    name: 'iPhone 12 Pro Max',
    category: 'iPhone',
    storages: ['128G', '256G', '512G'],
    colors: ['太平洋藍', '金色', '銀色', '石墨色'],
    launchDate: '2020-11-13',
    launchPrice: { '128G': 37900, '256G': 41400, '512G': 48400 },
    basePrice: { '128G': 37900, '256G': 41400, '512G': 48400 },
    marketAvg: { '128G': 6000, '256G': 7000, '512G': 8500 },
    tradeInPrice: 7400,
  },
  {
    id: 'iphone-12-pro',
    name: 'iPhone 12 Pro',
    category: 'iPhone',
    storages: ['128G', '256G', '512G'],
    colors: ['太平洋藍', '金色', '銀色', '石墨色'],
    launchDate: '2020-10-23',
    launchPrice: { '128G': 33900, '256G': 37400, '512G': 44400 },
    basePrice: { '128G': 33900, '256G': 37400, '512G': 44400 },
    marketAvg: { '128G': 5000, '256G': 6000, '512G': 7500 },
    tradeInPrice: 5800,
  },
  {
    id: 'iphone-12',
    name: 'iPhone 12',
    category: 'iPhone',
    storages: ['64G', '128G', '256G'],
    colors: ['黑色', '白色', '紅色', '藍色', '綠色'],
    launchDate: '2020-10-23',
    launchPrice: { '64G': 26900, '128G': 28500, '256G': 32000 },
    basePrice: { '64G': 26900, '128G': 28500, '256G': 32000 },
    marketAvg: { '64G': 3500, '128G': 4500, '256G': 5500 },
    tradeInPrice: 4000,
  },
  {
    id: 'iphone-11-pro-max',
    name: 'iPhone 11 Pro Max',
    category: 'iPhone',
    storages: ['64G', '256G', '512G'],
    colors: ['午夜綠', '金色', '銀色', '太空灰'],
    launchDate: '2019-09-20',
    launchPrice: { '64G': 39900, '256G': 45400, '512G': 52400 },
    basePrice: { '64G': 39900, '256G': 45400, '512G': 52400 },
    marketAvg: { '64G': 3500, '256G': 4000, '512G': 4500 },
    tradeInPrice: 4700,
  },
  {
    id: 'iphone-11-pro',
    name: 'iPhone 11 Pro',
    category: 'iPhone',
    storages: ['64G', '256G', '512G'],
    colors: ['午夜綠', '金色', '銀色', '太空灰'],
    launchDate: '2019-09-20',
    launchPrice: { '64G': 35900, '256G': 41400, '512G': 48400 },
    basePrice: { '64G': 35900, '256G': 41400, '512G': 48400 },
    marketAvg: { '64G': 3000, '256G': 3500, '512G': 4000 },
    tradeInPrice: 4200,
  },
  {
    id: 'iphone-11',
    name: 'iPhone 11',
    category: 'iPhone',
    storages: ['64G', '128G', '256G'],
    colors: ['黑色', '白色', '紅色', '黃色', '紫色', '綠色'],
    launchDate: '2019-09-20',
    launchPrice: { '64G': 24900, '128G': 26900, '256G': 30400 },
    basePrice: { '64G': 24900, '128G': 26900, '256G': 30400 },
    marketAvg: { '64G': 2500, '128G': 3000, '256G': 3300 },
    tradeInPrice: 3500,
  },
  {
    id: 'iphone-xr',
    name: 'iPhone XR',
    category: 'iPhone',
    storages: ['64G', '128G', '256G'],
    colors: ['黑色', '白色', '藍色', '珊瑚色', '黃色', '紅色'],
    launchDate: '2018-10-26',
    launchPrice: { '64G': 26900, '128G': 28900, '256G': 32500 },
    basePrice: { '64G': 26900, '128G': 28900, '256G': 32500 },
    marketAvg: { '64G': 2000, '128G': 2200, '256G': 2500 },
    tradeInPrice: 2400,
  },
  {
    id: 'iphone-xs-max',
    name: 'iPhone XS Max',
    category: 'iPhone',
    storages: ['64G', '256G', '512G'],
    colors: ['金色', '銀色', '太空灰'],
    launchDate: '2018-09-21',
    launchPrice: { '64G': 39900, '256G': 45500, '512G': 52900 },
    basePrice: { '64G': 39900, '256G': 45500, '512G': 52900 },
    marketAvg: { '64G': 2000, '256G': 2300, '512G': 2600 },
    tradeInPrice: 3000,
  },
  {
    id: 'iphone-xs',
    name: 'iPhone XS',
    category: 'iPhone',
    storages: ['64G', '256G', '512G'],
    colors: ['金色', '銀色', '太空灰'],
    launchDate: '2018-09-21',
    launchPrice: { '64G': 35900, '256G': 41500, '512G': 48900 },
    basePrice: { '64G': 35900, '256G': 41500, '512G': 48900 },
    marketAvg: { '64G': 1700, '256G': 2000, '512G': 2300 },
    tradeInPrice: 2300,
  },
  {
    id: 'iphone-x',
    name: 'iPhone X',
    category: 'iPhone',
    storages: ['64G', '256G'],
    colors: ['銀色', '太空灰'],
    launchDate: '2017-11-03',
    launchPrice: { '64G': 35900, '256G': 41500 },
    basePrice: { '64G': 35900, '256G': 41500 },
    marketAvg: { '64G': 1500, '256G': 1700 },
    tradeInPrice: 1600,
  },
  {
    id: 'iphone-8-plus',
    name: 'iPhone 8 Plus',
    category: 'iPhone',
    storages: ['64G', '256G'],
    colors: ['金色', '銀色', '太空灰'],
    launchDate: '2017-09-22',
    launchPrice: { '64G': 28900, '256G': 34500 },
    basePrice: { '64G': 28900, '256G': 34500 },
    marketAvg: { '64G': 1200, '256G': 1400 },
    tradeInPrice: null,
  },
  {
    id: 'iphone-8',
    name: 'iPhone 8',
    category: 'iPhone',
    storages: ['64G', '256G'],
    colors: ['金色', '銀色', '太空灰'],
    launchDate: '2017-09-22',
    launchPrice: { '64G': 25500, '256G': 30900 },
    basePrice: { '64G': 25500, '256G': 30900 },
    marketAvg: { '64G': 1000, '256G': 1200 },
    tradeInPrice: null,
  },
  {
    id: 'iphone-7-plus',
    name: 'iPhone 7 Plus',
    category: 'iPhone',
    storages: ['32G', '128G', '256G'],
    colors: ['黑色', '曜石黑色', '金色', '銀色', '玫瑰金'],
    launchDate: '2016-09-16',
    launchPrice: { '32G': 26900, '128G': 30900, '256G': 34900 },
    basePrice: { '32G': 26900, '128G': 30900, '256G': 34900 },
    marketAvg: { '32G': 700, '128G': 900, '256G': 1000 },
    tradeInPrice: null,
  },
  {
    id: 'iphone-7',
    name: 'iPhone 7',
    category: 'iPhone',
    storages: ['32G', '128G', '256G'],
    colors: ['黑色', '曜石黑色', '金色', '銀色', '玫瑰金'],
    launchDate: '2016-09-16',
    launchPrice: { '32G': 20900, '128G': 24900, '256G': 28900 },
    basePrice: { '32G': 20900, '128G': 24900, '256G': 28900 },
    marketAvg: { '32G': 500, '128G': 700, '256G': 800 },
    tradeInPrice: null,
  },
  {
    id: 'iphone-6s-plus',
    name: 'iPhone 6s Plus',
    category: 'iPhone',
    storages: ['16G', '64G', '128G'],
    colors: ['金色', '銀色', '太空灰', '玫瑰金'],
    launchDate: '2015-09-25',
    launchPrice: { '16G': 25900, '64G': 29900, '128G': 33900 },
    basePrice: { '16G': 25900, '64G': 29900, '128G': 33900 },
    marketAvg: { '16G': 300, '64G': 400, '128G': 500 },
    tradeInPrice: null,
  },
  {
    id: 'iphone-6s',
    name: 'iPhone 6s',
    category: 'iPhone',
    storages: ['16G', '64G', '128G'],
    colors: ['金色', '銀色', '太空灰', '玫瑰金'],
    launchDate: '2015-09-25',
    launchPrice: { '16G': 20900, '64G': 24900, '128G': 28900 },
    basePrice: { '16G': 20900, '64G': 24900, '128G': 28900 },
    marketAvg: { '16G': 200, '64G': 300, '128G': 400 },
    tradeInPrice: null,
  },
  {
    id: 'iphone-se-1',
    name: 'iPhone SE (第1代)',
    category: 'iPhone',
    storages: ['16G', '64G'],
    colors: ['金色', '銀色', '太空灰', '玫瑰金'],
    launchDate: '2016-03-31',
    launchPrice: { '16G': 13900, '64G': 17900 },
    basePrice: { '16G': 13900, '64G': 17900 },
    marketAvg: { '16G': 300, '64G': 500 },
    tradeInPrice: null,
  },
  {
    id: 'iphone-se-2',
    name: 'iPhone SE (第2代)',
    category: 'iPhone',
    storages: ['64G', '128G', '256G'],
    colors: ['黑色', '白色', '紅色'],
    launchDate: '2020-04-24',
    launchPrice: { '64G': 14900, '128G': 16900, '256G': 20900 },
    basePrice: { '64G': 14900, '128G': 16900, '256G': 20900 },
    marketAvg: { '64G': 2500, '128G': 3500, '256G': 4500 },
    tradeInPrice: 1600,
  },

  // ==================== MacBook Pro M5 ====================
  {
    id: 'macbook-pro-14-m5',
    name: 'MacBook Pro 14吋 M5',
    category: 'MacBook',
    storages: ['16G/1T'],
    colors: ['太空黑色', '銀色'],
    launchDate: '2026-03-11',
    launchPrice: { '16G/1T': 54900 },
    basePrice: { '16G/1T': 54900 },
    marketAvg: { '16G/1T': 47500 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-14-m5-pro',
    name: 'MacBook Pro 14吋 M5 Pro',
    category: 'MacBook',
    storages: ['24G/1T'],
    colors: ['太空黑色', '銀色'],
    launchDate: '2026-03-11',
    launchPrice: { '24G/1T': 74900 },
    basePrice: { '24G/1T': 74900 },
    marketAvg: { '24G/1T': 64000 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-14-m5-max',
    name: 'MacBook Pro 14吋 M5 Max',
    category: 'MacBook',
    storages: ['36G/2T'],
    colors: ['太空黑色', '銀色'],
    launchDate: '2026-03-11',
    launchPrice: { '36G/2T': 119900 },
    basePrice: { '36G/2T': 119900 },
    marketAvg: { '36G/2T': 101000 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-16-m5-pro',
    name: 'MacBook Pro 16吋 M5 Pro',
    category: 'MacBook',
    storages: ['24G/1T'],
    colors: ['太空黑色', '銀色'],
    launchDate: '2026-03-11',
    launchPrice: { '24G/1T': 89900 },
    basePrice: { '24G/1T': 89900 },
    marketAvg: { '24G/1T': 76500 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-16-m5-max',
    name: 'MacBook Pro 16吋 M5 Max',
    category: 'MacBook',
    storages: ['36G/2T'],
    colors: ['太空黑色', '銀色'],
    launchDate: '2026-03-11',
    launchPrice: { '36G/2T': 129900 },
    basePrice: { '36G/2T': 129900 },
    marketAvg: { '36G/2T': 120000 },
    tradeInPrice: 20100,
  },

  // ==================== 2026 新品 ====================
  {
    id: 'macbook-air-m5-13',
    name: 'MacBook Air 13吋 M5',
    category: 'MacBook',
    storages: ['16G/512G'],
    colors: ['午夜色', '星光色', '太空灰', '銀色'],
    launchDate: '2026-03-11',
    launchPrice: { '16G/512G': 35900 },
    basePrice: { '16G/512G': 35900 },
    marketAvg: { '16G/512G': 33000 },
    tradeInPrice: 10700,
  },
  {
    id: 'macbook-air-m5-15',
    name: 'MacBook Air 15吋 M5',
    category: 'MacBook',
    storages: ['16G/512G'],
    colors: ['午夜色', '星光色', '太空灰', '銀色'],
    launchDate: '2026-03-11',
    launchPrice: { '16G/512G': 42900 },
    basePrice: { '16G/512G': 42900 },
    marketAvg: { '16G/512G': 39500 },
    tradeInPrice: 10700,
  },
  {
    id: 'ipad-pro-m5-13',
    name: 'iPad Pro 13吋 M5',
    category: 'iPad',
    storages: ['256G', '512G', '1T', '2T'],
    colors: ['銀色', '太空黑色'],
    launchDate: '2026-05-13',
    launchPrice: { '256G': 50900, '512G': 57900, '1T': 71900, '2T': 89400 },
    basePrice: { '256G': 50900, '512G': 57900, '1T': 71900, '2T': 89400 },
    marketAvg: { '256G': 47500, '512G': 54000, '1T': 67000, '2T': 83500 },
    tradeInPrice: null,
  },
  {
    id: 'ipad-pro-m5-11',
    name: 'iPad Pro 11吋 M5',
    category: 'iPad',
    storages: ['256G', '512G', '1T', '2T'],
    colors: ['銀色', '太空黑色'],
    launchDate: '2026-05-13',
    launchPrice: { '256G': 39900, '512G': 46900, '1T': 60900, '2T': 78400 },
    basePrice: { '256G': 39900, '512G': 46900, '1T': 60900, '2T': 78400 },
    marketAvg: { '256G': 37400, '512G': 44000, '1T': 57000, '2T': 73500 },
    tradeInPrice: null,
  },
  {
    id: 'ipad-air-m4-13',
    name: 'iPad Air 13吋 M4',
    category: 'iPad',
    storages: ['128G', '256G', '512G', '1T'],
    colors: ['太空灰色', '藍色', '紫色', '星光色'],
    launchDate: '2026-05-13',
    launchPrice: { '128G': 31900, '256G': 35400, '512G': 42400, '1T': 52900 },
    basePrice: { '128G': 31900, '256G': 35400, '512G': 42400, '1T': 52900 },
    marketAvg: { '128G': 26500, '256G': 29500, '512G': 35300, '1T': 44000 },
    tradeInPrice: null,
  },
  {
    id: 'ipad-air-m4-11',
    name: 'iPad Air 11吋 M4',
    category: 'iPad',
    storages: ['128G', '256G', '512G', '1T'],
    colors: ['太空灰色', '藍色', '紫色', '星光色'],
    launchDate: '2026-05-13',
    launchPrice: { '128G': 24900, '256G': 28400, '512G': 35400, '1T': 45900 },
    basePrice: { '128G': 24900, '256G': 28400, '512G': 35400, '1T': 45900 },
    marketAvg: { '128G': 20500, '256G': 23500, '512G': 29500, '1T': 38200 },
    tradeInPrice: null,
  },

  // ==================== 2025 新品 ====================
  {
    id: 'macbook-air-m4-13',
    name: 'MacBook Air 13吋 M4',
    category: 'MacBook',
    storages: ['16G/256G'],
    colors: ['天藍色', '午夜色', '星光色', '銀色'],
    launchDate: '2025-03-12',
    launchPrice: { '16G/256G': 32900 },
    basePrice: { '16G/256G': 32900 },
    marketAvg: { '16G/256G': 27000 },
    tradeInPrice: 10700,
  },
  {
    id: 'macbook-air-m4-15',
    name: 'MacBook Air 15吋 M4',
    category: 'MacBook',
    storages: ['16G/256G'],
    colors: ['天藍色', '午夜色', '星光色', '銀色'],
    launchDate: '2025-03-12',
    launchPrice: { '16G/256G': 39900 },
    basePrice: { '16G/256G': 39900 },
    marketAvg: { '16G/256G': 33000 },
    tradeInPrice: 10700,
  },
  {
    id: 'ipad-air-m3-11',
    name: 'iPad Air 11吋 M3',
    category: 'iPad',
    storages: ['128G', '256G', '512G', '1T'],
    colors: ['太空灰色', '藍色', '紫色', '星光色'],
    launchDate: '2025-03-04',
    launchPrice: { '128G': 19900, '256G': 23400, '512G': 30400, '1T': 37400 },
    basePrice: { '128G': 19900, '256G': 23400, '512G': 30400, '1T': 37400 },
    marketAvg: { '128G': 16000, '256G': 19000, '512G': 25500, '1T': 32000 },
    tradeInPrice: 23900,
  },
  {
    id: 'ipad-11',
    name: 'iPad 第11代',
    category: 'iPad',
    storages: ['128G', '256G', '512G'],
    colors: ['藍色', '粉紅色', '黃色', '銀色'],
    launchDate: '2025-03-04',
    launchPrice: { '128G': 11900, '256G': 15900, '512G': 21900 },
    basePrice: { '128G': 11900, '256G': 15900, '512G': 21900 },
    marketAvg: { '128G': 9800, '256G': 14500, '512G': 19800 },
    tradeInPrice: 12600,
  },
  {
    id: 'ipad-air-m3-13',
    name: 'iPad Air 13吋 M3',
    category: 'iPad',
    storages: ['128G', '256G', '512G', '1T'],
    colors: ['太空灰色', '藍色', '紫色', '星光色'],
    launchDate: '2025-03-04',
    launchPrice: { '128G': 26900, '256G': 30400, '512G': 37400, '1T': 44400 },
    basePrice: { '128G': 26900, '256G': 30400, '512G': 37400, '1T': 44400 },
    marketAvg: { '128G': 22000, '256G': 25000, '512G': 31500, '1T': 38000 },
    tradeInPrice: 23900,
  },
  {
    id: 'apple-watch-ultra-3',
    name: 'Apple Watch Ultra 3',
    category: 'Apple Watch',
    storages: ['鈦金屬'],
    colors: ['原色鈦金屬', '黑色鈦金屬'],
    launchDate: '2025-09-19',
    launchPrice: { '鈦金屬': 26900 },
    basePrice: { '鈦金屬': 26900 },
    marketAvg: { '鈦金屬': 18000 },
    tradeInPrice: null,
  },
  {
    id: 'apple-watch-s11',
    name: 'Apple Watch Series 11',
    category: 'Apple Watch',
    storages: ['42mm', '46mm'],
    colors: ['太空灰色', '銀色', '玫瑰金色', '曜石黑色', '原色', '金色', '石瓦色'],
    launchDate: '2025-09-19',
    launchPrice: { '42mm': 12900, '46mm': 13900 },
    basePrice: { '42mm': 12900, '46mm': 13900 },
    marketAvg: { '42mm': 8500, '46mm': 9500 },
    tradeInPrice: null,
  },
  {
    id: 'airpods-pro-3',
    name: 'AirPods Pro 第3代',
    category: 'AirPods',
    storages: ['標準版'],
    colors: ['白色'],
    launchDate: '2025-09-19',
    launchPrice: { '標準版': 7490 },
    basePrice: { '標準版': 7490 },
    marketAvg: { '標準版': 6800 },
    tradeInPrice: null,
  },

  // ==================== MacBook ====================
  {
    id: 'macbook-air-m3-15',
    name: 'MacBook Air 15吋 M3',
    category: 'MacBook',
    storages: ['8G/256G'],
    colors: ['午夜色', '星光色', '太空灰', '銀色'],
    launchDate: '2024-03-08',
    launchPrice: { '8G/256G': 42900 },
    basePrice: { '8G/256G': 42900 },
    marketAvg: { '8G/256G': 31000 },
    tradeInPrice: 10700,
  },
  {
    id: 'macbook-air-m3-13',
    name: 'MacBook Air 13吋 M3',
    category: 'MacBook',
    storages: ['8G/256G'],
    colors: ['午夜色', '星光色', '太空灰', '銀色'],
    launchDate: '2024-03-08',
    launchPrice: { '8G/256G': 35900 },
    basePrice: { '8G/256G': 35900 },
    marketAvg: { '8G/256G': 26000 },
    tradeInPrice: 10700,
  },
  {
    id: 'macbook-air-m2-15',
    name: 'MacBook Air 15吋 M2',
    category: 'MacBook',
    storages: ['8G/256G'],
    colors: ['午夜色', '星光色', '太空灰', '銀色'],
    launchDate: '2023-06-05',
    launchPrice: { '8G/256G': 38900 },
    basePrice: { '8G/256G': 38900 },
    marketAvg: { '8G/256G': 23000 },
    tradeInPrice: 10700,
  },
  {
    id: 'macbook-air-m2-13',
    name: 'MacBook Air 13吋 M2',
    category: 'MacBook',
    storages: ['8G/256G'],
    colors: ['午夜色', '星光色', '太空灰', '銀色'],
    launchDate: '2022-06-17',
    launchPrice: { '8G/256G': 32900 },
    basePrice: { '8G/256G': 32900 },
    marketAvg: { '8G/256G': 19000 },
    tradeInPrice: 10700,
  },
  {
    id: 'macbook-pro-16-m4-pro',
    name: 'MacBook Pro 16吋 M4 Pro',
    category: 'MacBook',
    storages: ['24G/512G'],
    colors: ['太空黑色', '銀色'],
    launchDate: '2024-11-08',
    launchPrice: { '24G/512G': 79900 },
    basePrice: { '24G/512G': 79900 },
    marketAvg: { '24G/512G': 65000 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-16-m4-max',
    name: 'MacBook Pro 16吋 M4 Max',
    category: 'MacBook',
    storages: ['36G/1T'],
    colors: ['太空黑色', '銀色'],
    launchDate: '2024-11-08',
    launchPrice: { '36G/1T': 119900 },
    basePrice: { '36G/1T': 119900 },
    marketAvg: { '36G/1T': 90000 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-14-m4-pro',
    name: 'MacBook Pro 14吋 M4 Pro',
    category: 'MacBook',
    storages: ['24G/512G'],
    colors: ['太空黑色', '銀色'],
    launchDate: '2024-11-08',
    launchPrice: { '24G/512G': 69900 },
    basePrice: { '24G/512G': 69900 },
    marketAvg: { '24G/512G': 56000 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-14-m4-max',
    name: 'MacBook Pro 14吋 M4 Max',
    category: 'MacBook',
    storages: ['36G/1T'],
    colors: ['太空黑色', '銀色'],
    launchDate: '2024-11-08',
    launchPrice: { '36G/1T': 109900 },
    basePrice: { '36G/1T': 109900 },
    marketAvg: { '36G/1T': 82000 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-14-m4',
    name: 'MacBook Pro 14吋 M4',
    category: 'MacBook',
    storages: ['16G/512G'],
    colors: ['太空黑色', '銀色'],
    launchDate: '2024-11-08',
    launchPrice: { '16G/512G': 52900 },
    basePrice: { '16G/512G': 52900 },
    marketAvg: { '16G/512G': 42000 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-14-m3',
    name: 'MacBook Pro 14吋 M3',
    category: 'MacBook',
    storages: ['8G/512G'],
    colors: ['太空黑色', '銀色'],
    launchDate: '2023-11-07',
    launchPrice: { '8G/512G': 52900 },
    basePrice: { '8G/512G': 52900 },
    marketAvg: { '8G/512G': 36000 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-14-m3-pro',
    name: 'MacBook Pro 14吋 M3 Pro',
    category: 'MacBook',
    storages: ['18G/512G'],
    colors: ['太空黑色', '銀色'],
    launchDate: '2023-11-07',
    launchPrice: { '18G/512G': 69900 },
    basePrice: { '18G/512G': 69900 },
    marketAvg: { '18G/512G': 47000 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-14-m3-max',
    name: 'MacBook Pro 14吋 M3 Max',
    category: 'MacBook',
    storages: ['36G/1T'],
    colors: ['太空黑色', '銀色'],
    launchDate: '2023-11-07',
    launchPrice: { '36G/1T': 105900 },
    basePrice: { '36G/1T': 105900 },
    marketAvg: { '36G/1T': 72000 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-16-m3-pro',
    name: 'MacBook Pro 16吋 M3 Pro',
    category: 'MacBook',
    storages: ['18G/512G'],
    colors: ['太空黑色', '銀色'],
    launchDate: '2023-11-07',
    launchPrice: { '18G/512G': 79900 },
    basePrice: { '18G/512G': 79900 },
    marketAvg: { '18G/512G': 55000 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-16-m3-max',
    name: 'MacBook Pro 16吋 M3 Max',
    category: 'MacBook',
    storages: ['36G/1T'],
    colors: ['太空黑色', '銀色'],
    launchDate: '2023-11-07',
    launchPrice: { '36G/1T': 115900 },
    basePrice: { '36G/1T': 115900 },
    marketAvg: { '36G/1T': 82000 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-14-m2-pro',
    name: 'MacBook Pro 14吋 M2 Pro',
    category: 'MacBook',
    storages: ['16G/512G'],
    colors: ['太空灰', '銀色'],
    launchDate: '2023-01-24',
    launchPrice: { '16G/512G': 64900 },
    basePrice: { '16G/512G': 64900 },
    marketAvg: { '16G/512G': 39000 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-14-m2-max',
    name: 'MacBook Pro 14吋 M2 Max',
    category: 'MacBook',
    storages: ['32G/1T'],
    colors: ['太空灰', '銀色'],
    launchDate: '2023-01-24',
    launchPrice: { '32G/1T': 97900 },
    basePrice: { '32G/1T': 97900 },
    marketAvg: { '32G/1T': 62000 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-16-m2-pro',
    name: 'MacBook Pro 16吋 M2 Pro',
    category: 'MacBook',
    storages: ['16G/512G'],
    colors: ['太空灰', '銀色'],
    launchDate: '2023-01-24',
    launchPrice: { '16G/512G': 79900 },
    basePrice: { '16G/512G': 79900 },
    marketAvg: { '16G/512G': 48000 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-16-m2-max',
    name: 'MacBook Pro 16吋 M2 Max',
    category: 'MacBook',
    storages: ['32G/1T'],
    colors: ['太空灰', '銀色'],
    launchDate: '2023-01-24',
    launchPrice: { '32G/1T': 107900 },
    basePrice: { '32G/1T': 107900 },
    marketAvg: { '32G/1T': 70000 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-13-m2',
    name: 'MacBook Pro 13吋 M2',
    category: 'MacBook',
    storages: ['8G/256G'],
    colors: ['太空灰', '銀色'],
    launchDate: '2022-06-24',
    launchPrice: { '8G/256G': 39900 },
    basePrice: { '8G/256G': 39900 },
    marketAvg: { '8G/256G': 16000 },
    tradeInPrice: 20100,
  },

  // ==================== MacBook 舊機 ====================
  {
    id: 'macbook-air-m1',
    name: 'MacBook Air M1',
    category: 'MacBook',
    storages: ['8G/256G'],
    colors: ['太空灰', '銀色', '金色'],
    launchDate: '2020-11-17',
    launchPrice: { '8G/256G': 29900 },
    basePrice: { '8G/256G': 29900 },
    marketAvg: { '8G/256G': 12000 },
    tradeInPrice: 10700,
  },
  {
    id: 'macbook-pro-m1-14',
    name: 'MacBook Pro 14吋 M1 Pro',
    category: 'MacBook',
    storages: ['16G/512G'],
    colors: ['太空灰', '銀色'],
    launchDate: '2021-10-26',
    launchPrice: { '16G/512G': 54900 },
    basePrice: { '16G/512G': 54900 },
    marketAvg: { '16G/512G': 28000 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-14-m1-max',
    name: 'MacBook Pro 14吋 M1 Max',
    category: 'MacBook',
    storages: ['32G/1T'],
    colors: ['太空灰', '銀色'],
    launchDate: '2021-10-26',
    launchPrice: { '32G/1T': 94900 },
    basePrice: { '32G/1T': 94900 },
    marketAvg: { '32G/1T': 47000 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-m1-16',
    name: 'MacBook Pro 16吋 M1 Pro',
    category: 'MacBook',
    storages: ['16G/512G'],
    colors: ['太空灰', '銀色'],
    launchDate: '2021-10-26',
    launchPrice: { '16G/512G': 64900 },
    basePrice: { '16G/512G': 64900 },
    marketAvg: { '16G/512G': 34000 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-16-m1-max',
    name: 'MacBook Pro 16吋 M1 Max',
    category: 'MacBook',
    storages: ['32G/1T'],
    colors: ['太空灰', '銀色'],
    launchDate: '2021-10-26',
    launchPrice: { '32G/1T': 104900 },
    basePrice: { '32G/1T': 104900 },
    marketAvg: { '32G/1T': 54000 },
    tradeInPrice: 20100,
  },
  {
    id: 'macbook-pro-13-m1',
    name: 'MacBook Pro 13吋 M1',
    category: 'MacBook',
    storages: ['8G/256G'],
    colors: ['太空灰', '銀色'],
    launchDate: '2020-11-17',
    launchPrice: { '8G/256G': 39900 },
    basePrice: { '8G/256G': 39900 },
    marketAvg: { '8G/256G': 13000 },
    tradeInPrice: 20100,
  },

  // ==================== iPad ====================
  {
    id: 'ipad-pro-m4-13',
    name: 'iPad Pro 13吋 M4',
    category: 'iPad',
    storages: ['256G', '512G', '1T', '2T'],
    colors: ['銀色', '太空黑色'],
    launchDate: '2024-05-15',
    launchPrice: { '256G': 42900, '512G': 49900, '1T': 63900, '2T': 77900 },
    basePrice: { '256G': 42900, '512G': 49900, '1T': 63900, '2T': 77900 },
    marketAvg: { '256G': 36000, '512G': 42000, '1T': 54000, '2T': 66000 },
    tradeInPrice: 26700,
  },
  {
    id: 'ipad-pro-m4-11',
    name: 'iPad Pro 11吋 M4',
    category: 'iPad',
    storages: ['256G', '512G', '1T', '2T'],
    colors: ['銀色', '太空黑色'],
    launchDate: '2024-05-15',
    launchPrice: { '256G': 29900, '512G': 36900, '1T': 50900, '2T': 64900 },
    basePrice: { '256G': 29900, '512G': 36900, '1T': 50900, '2T': 64900 },
    marketAvg: { '256G': 25000, '512G': 31000, '1T': 43000, '2T': 55000 },
    tradeInPrice: 26700,
  },
  {
    id: 'ipad-air-m2-13',
    name: 'iPad Air 13吋 M2',
    category: 'iPad',
    storages: ['128G', '256G', '512G', '1T'],
    colors: ['藍色', '紫色', '星光色', '太空灰'],
    launchDate: '2024-05-07',
    launchPrice: { '128G': 26900, '256G': 30400, '512G': 37400, '1T': 44400 },
    basePrice: { '128G': 26900, '256G': 30400, '512G': 37400, '1T': 44400 },
    marketAvg: { '128G': 20000, '256G': 23500, '512G': 30000, '1T': 36000 },
    tradeInPrice: 23900,
  },
  {
    id: 'ipad-air-m2-11',
    name: 'iPad Air 11吋 M2',
    category: 'iPad',
    storages: ['128G', '256G', '512G', '1T'],
    colors: ['藍色', '紫色', '星光色', '太空灰'],
    launchDate: '2024-05-07',
    launchPrice: { '128G': 19900, '256G': 23400, '512G': 30400, '1T': 37400 },
    basePrice: { '128G': 19900, '256G': 23400, '512G': 30400, '1T': 37400 },
    marketAvg: { '128G': 14000, '256G': 17500, '512G': 23500, '1T': 30000 },
    tradeInPrice: 23900,
  },
  {
    id: 'ipad-10',
    name: 'iPad 第10代',
    category: 'iPad',
    storages: ['64G', '256G'],
    colors: ['藍色', '粉紅色', '黃色', '銀色'],
    launchDate: '2022-10-26',
    launchPrice: { '64G': 13900, '256G': 18900 },
    basePrice: { '64G': 13900, '256G': 18900 },
    marketAvg: { '64G': 10000, '256G': 14500 },
    tradeInPrice: 12600,
  },
  {
    id: 'ipad-mini-7',
    name: 'iPad mini 第7代',
    category: 'iPad',
    storages: ['128G', '256G', '512G'],
    colors: ['太空灰色', '藍色', '紫色', '星光色'],
    launchDate: '2024-10-23',
    launchPrice: { '128G': 15900, '256G': 19900, '512G': 27900 },
    basePrice: { '128G': 15900, '256G': 19900, '512G': 27900 },
    marketAvg: { '128G': 13500, '256G': 17000, '512G': 23500 },
    tradeInPrice: 13000,
  },

  // ==================== iPad 舊機 ====================
  {
    id: 'ipad-9',
    name: 'iPad 第9代',
    category: 'iPad',
    storages: ['64G', '256G'],
    colors: ['銀色', '太空灰'],
    launchDate: '2021-09-24',
    launchPrice: { '64G': 10900, '256G': 15900 },
    basePrice: { '64G': 10900, '256G': 15900 },
    marketAvg: { '64G': 5500, '256G': 8500 },
    tradeInPrice: 12600,
  },
  {
    id: 'ipad-8',
    name: 'iPad 第8代',
    category: 'iPad',
    storages: ['32G', '128G'],
    colors: ['銀色', '太空灰', '金色'],
    launchDate: '2020-09-18',
    launchPrice: { '32G': 9900, '128G': 13900 },
    basePrice: { '32G': 9900, '128G': 13900 },
    marketAvg: { '32G': 3500, '128G': 5500 },
    tradeInPrice: 12600,
  },
  {
    id: 'ipad-mini-6',
    name: 'iPad mini 第6代',
    category: 'iPad',
    storages: ['64G', '256G'],
    colors: ['星光色', '太空灰', '紫色', '粉紅色'],
    launchDate: '2021-09-24',
    launchPrice: { '64G': 13900, '256G': 18900 },
    basePrice: { '64G': 13900, '256G': 18900 },
    marketAvg: { '64G': 8000, '256G': 11000 },
    tradeInPrice: 13000,
  },
  {
    id: 'ipad-mini-5',
    name: 'iPad mini 第5代',
    category: 'iPad',
    storages: ['64G', '256G'],
    colors: ['銀色', '太空灰', '金色'],
    launchDate: '2019-03-28',
    launchPrice: { '64G': 12900, '256G': 17900 },
    basePrice: { '64G': 12900, '256G': 17900 },
    marketAvg: { '64G': 4000, '256G': 6000 },
    tradeInPrice: 13000,
  },
  {
    id: 'ipad-air-5',
    name: 'iPad Air 第5代（M1）',
    category: 'iPad',
    storages: ['64G', '256G'],
    colors: ['太空灰', '星光色', '藍色', '紫色', '粉紅色'],
    launchDate: '2022-03-18',
    launchPrice: { '64G': 19900, '256G': 24900 },
    basePrice: { '64G': 19900, '256G': 24900 },
    marketAvg: { '64G': 9000, '256G': 12000 },
    tradeInPrice: 23900,
  },
  {
    id: 'ipad-air-4',
    name: 'iPad Air 第4代',
    category: 'iPad',
    storages: ['64G', '256G'],
    colors: ['天藍色', '玫瑰金', '綠色', '銀色', '太空灰'],
    launchDate: '2020-10-23',
    launchPrice: { '64G': 18900, '256G': 23900 },
    basePrice: { '64G': 18900, '256G': 23900 },
    marketAvg: { '64G': 8000, '256G': 11000 },
    tradeInPrice: null,
  },
  {
    id: 'ipad-pro-m1-12',
    name: 'iPad Pro 12.9吋 M1',
    category: 'iPad',
    storages: ['128G', '256G', '512G', '1T', '2T'],
    colors: ['銀色', '太空灰'],
    launchDate: '2021-05-21',
    launchPrice: { '128G': 32900, '256G': 36900, '512G': 44900, '1T': 56900, '2T': 68900 },
    basePrice: { '128G': 32900, '256G': 36900, '512G': 44900, '1T': 56900, '2T': 68900 },
    marketAvg: { '128G': 16000, '256G': 19000, '512G': 24000, '1T': 30000, '2T': 38000 },
    tradeInPrice: null,
  },
  {
    id: 'ipad-pro-m1-11',
    name: 'iPad Pro 11吋 M1',
    category: 'iPad',
    storages: ['128G', '256G', '512G', '1T', '2T'],
    colors: ['銀色', '太空灰'],
    launchDate: '2021-05-21',
    launchPrice: { '128G': 23900, '256G': 27900, '512G': 35900, '1T': 47900, '2T': 59900 },
    basePrice: { '128G': 23900, '256G': 27900, '512G': 35900, '1T': 47900, '2T': 59900 },
    marketAvg: { '128G': 12000, '256G': 15000, '512G': 20000, '1T': 26000, '2T': 33000 },
    tradeInPrice: null,
  },

  // ==================== Apple Watch ====================
  {
    id: 'apple-watch-ultra-2',
    name: 'Apple Watch Ultra 2',
    category: 'Apple Watch',
    storages: ['鈦金屬'],
    colors: ['鈦金屬原色'],
    launchDate: '2023-09-22',
    launchPrice: { '鈦金屬': 29900 },
    basePrice: { '鈦金屬': 29900 },
    marketAvg: { '鈦金屬': 15000 },
    tradeInPrice: 7800,
  },
  {
    id: 'apple-watch-s10',
    name: 'Apple Watch Series 10',
    category: 'Apple Watch',
    storages: ['42mm', '46mm'],
    colors: ['噴射黑', '玫瑰金', '銀色', '原色', '金色', '石瓦色'],
    launchDate: '2024-09-20',
    launchPrice: { '42mm': 12900, '46mm': 13900 },
    basePrice: { '42mm': 12900, '46mm': 13900 },
    marketAvg: { '42mm': 7500, '46mm': 8000 },
    tradeInPrice: 8000,
  },
  {
    id: 'apple-watch-s9',
    name: 'Apple Watch Series 9',
    category: 'Apple Watch',
    storages: ['41mm', '45mm'],
    colors: ['午夜色', '星光色', '粉紅色', '紅色', '銀色'],
    launchDate: '2023-09-22',
    launchPrice: { '41mm': 12900, '45mm': 13900 },
    basePrice: { '41mm': 12900, '45mm': 13900 },
    marketAvg: { '41mm': 6500, '45mm': 7200 },
    tradeInPrice: 3500,
  },
  {
    id: 'apple-watch-se-3',
    name: 'Apple Watch SE 3',
    category: 'Apple Watch',
    storages: ['40mm', '44mm'],
    colors: ['午夜色', '星光色'],
    launchDate: '2025-09-19',
    launchPrice: { '40mm': 7900, '44mm': 8900 },
    basePrice: { '40mm': 7900, '44mm': 8900 },
    marketAvg: { '40mm': 6200, '44mm': 7200 },
    tradeInPrice: null,
  },
  {
    id: 'apple-watch-se-2',
    name: 'Apple Watch SE 第2代',
    category: 'Apple Watch',
    storages: ['40mm', '44mm'],
    colors: ['午夜色', '星光色', '銀色'],
    launchDate: '2022-09-16',
    launchPrice: { '40mm': 8900, '44mm': 9900 },
    basePrice: { '40mm': 8900, '44mm': 9900 },
    marketAvg: { '40mm': 4000, '44mm': 4600 },
    tradeInPrice: 1100,
  },

  // ==================== Apple Watch 舊機 ====================
  {
    id: 'apple-watch-ultra-1',
    name: 'Apple Watch Ultra',
    category: 'Apple Watch',
    storages: ['鈦金屬'],
    colors: ['鈦金屬原色'],
    launchDate: '2022-09-23',
    launchPrice: { '鈦金屬': 26900 },
    basePrice: { '鈦金屬': 26900 },
    marketAvg: { '鈦金屬': 10000 },
    tradeInPrice: 5700,
  },
  {
    id: 'apple-watch-s8',
    name: 'Apple Watch Series 8',
    category: 'Apple Watch',
    storages: ['41mm', '45mm'],
    colors: ['午夜色', '星光色', '紅色', '銀色'],
    launchDate: '2022-09-16',
    launchPrice: { '41mm': 12900, '45mm': 13900 },
    basePrice: { '41mm': 12900, '45mm': 13900 },
    marketAvg: { '41mm': 5800, '45mm': 6600 },
    tradeInPrice: 2200,
  },
  {
    id: 'apple-watch-s7',
    name: 'Apple Watch Series 7',
    category: 'Apple Watch',
    storages: ['41mm', '45mm'],
    colors: ['午夜色', '星光色', '綠色', '藍色', '紅色'],
    launchDate: '2021-10-15',
    launchPrice: { '41mm': 12900, '45mm': 13900 },
    basePrice: { '41mm': 12900, '45mm': 13900 },
    marketAvg: { '41mm': 3000, '45mm': 3800 },
    tradeInPrice: 1200,
  },
  {
    id: 'apple-watch-s6',
    name: 'Apple Watch Series 6',
    category: 'Apple Watch',
    storages: ['40mm', '44mm'],
    colors: ['藍色', '紅色', '金色', '銀色', '太空灰', '太空黑'],
    launchDate: '2020-09-18',
    launchPrice: { '40mm': 12900, '44mm': 13900 },
    basePrice: { '40mm': 12900, '44mm': 13900 },
    marketAvg: { '40mm': 2800, '44mm': 3500 },
    tradeInPrice: 800,
  },
  {
    id: 'apple-watch-se-1',
    name: 'Apple Watch SE 第1代',
    category: 'Apple Watch',
    storages: ['40mm', '44mm'],
    colors: ['銀色', '太空灰', '金色'],
    launchDate: '2020-09-18',
    launchPrice: { '40mm': 8900, '44mm': 9900 },
    basePrice: { '40mm': 8900, '44mm': 9900 },
    marketAvg: { '40mm': 1800, '44mm': 2200 },
    tradeInPrice: null,
  },
  {
    id: 'apple-watch-s5',
    name: 'Apple Watch Series 5',
    category: 'Apple Watch',
    storages: ['40mm', '44mm'],
    colors: ['銀色', '太空灰', '金色', '太空黑'],
    launchDate: '2019-09-20',
    launchPrice: { '40mm': 12900, '44mm': 13900 },
    basePrice: { '40mm': 12900, '44mm': 13900 },
    marketAvg: { '40mm': 1600, '44mm': 2200 },
    tradeInPrice: null,
  },
  {
    id: 'apple-watch-s3',
    name: 'Apple Watch Series 3',
    category: 'Apple Watch',
    storages: ['38mm', '42mm'],
    colors: ['銀色', '太空灰', '金色'],
    launchDate: '2017-09-22',
    launchPrice: { '38mm': 9200, '42mm': 10200 },
    basePrice: { '38mm': 9200, '42mm': 10200 },
    marketAvg: { '38mm': 500, '42mm': 800 },
    tradeInPrice: null,
  },

  // ==================== AirPods ====================
  {
    id: 'airpods-pro-2',
    name: 'AirPods Pro 第2代',
    category: 'AirPods',
    storages: ['標準版'],
    colors: ['白色'],
    launchDate: '2022-09-23',
    launchPrice: { '標準版': 7490 },
    basePrice: { '標準版': 7490 },
    marketAvg: { '標準版': 4200 },
    tradeInPrice: null,
  },
  {
    id: 'airpods-4-anc',
    name: 'AirPods 4（主動降噪版）',
    category: 'AirPods',
    storages: ['標準版'],
    colors: ['白色'],
    launchDate: '2024-09-20',
    launchPrice: { '標準版': 5990 },
    basePrice: { '標準版': 5990 },
    marketAvg: { '標準版': 3800 },
    tradeInPrice: null,
  },
  {
    id: 'airpods-4',
    name: 'AirPods 4',
    category: 'AirPods',
    storages: ['標準版'],
    colors: ['白色'],
    launchDate: '2024-09-20',
    launchPrice: { '標準版': 4490 },
    basePrice: { '標準版': 4490 },
    marketAvg: { '標準版': 2800 },
    tradeInPrice: null,
  },
  {
    id: 'airpods-max-2',
    name: 'AirPods Max（USB-C）',
    category: 'AirPods',
    storages: ['標準版'],
    colors: ['午夜色', '星光色', '藍色', '紫色', '橙色'],
    launchDate: '2024-09-09',
    launchPrice: { '標準版': 17990 },
    basePrice: { '標準版': 17990 },
    marketAvg: { '標準版': 12000 },
    tradeInPrice: null,
  },

  // ==================== Mac ====================
  {
    id: 'mac-studio-m4-max',
    name: 'Mac Studio M4 Max',
    category: 'Mac',
    storages: ['36G/512G'],
    colors: ['銀色'],
    launchDate: '2025-05-07',
    launchPrice: { '36G/512G': 67900 },
    basePrice: { '36G/512G': 67900 },
    marketAvg: { '36G/512G': 62000 },
    tradeInPrice: 37400,
  },
  {
    id: 'mac-studio-m3-ultra',
    name: 'Mac Studio M3 Ultra',
    category: 'Mac',
    storages: ['96G/1T'],
    colors: ['銀色'],
    launchDate: '2025-05-07',
    launchPrice: { '96G/1T': 137900 },
    basePrice: { '96G/1T': 137900 },
    marketAvg: { '96G/1T': 126000 },
    tradeInPrice: 37400,
  },
  {
    id: 'mac-studio-m2-max',
    name: 'Mac Studio M2 Max',
    category: 'Mac',
    storages: ['32G/512G'],
    colors: ['銀色'],
    launchDate: '2023-06-13',
    launchPrice: { '32G/512G': 67900 },
    basePrice: { '32G/512G': 67900 },
    marketAvg: { '32G/512G': 43000 },
    tradeInPrice: 37400,
  },
  {
    id: 'mac-studio-m2-ultra',
    name: 'Mac Studio M2 Ultra',
    category: 'Mac',
    storages: ['64G/1T'],
    colors: ['銀色'],
    launchDate: '2023-06-13',
    launchPrice: { '64G/1T': 137900 },
    basePrice: { '64G/1T': 137900 },
    marketAvg: { '64G/1T': 85000 },
    tradeInPrice: 37400,
  },
  {
    id: 'mac-studio-m1-max',
    name: 'Mac Studio M1 Max',
    category: 'Mac',
    storages: ['32G/512G'],
    colors: ['銀色'],
    launchDate: '2022-03-18',
    launchPrice: { '32G/512G': 59900 },
    basePrice: { '32G/512G': 59900 },
    marketAvg: { '32G/512G': 34000 },
    tradeInPrice: 37400,
  },
  {
    id: 'mac-studio-m1-ultra',
    name: 'Mac Studio M1 Ultra',
    category: 'Mac',
    storages: ['64G/1T'],
    colors: ['銀色'],
    launchDate: '2022-03-18',
    launchPrice: { '64G/1T': 119900 },
    basePrice: { '64G/1T': 119900 },
    marketAvg: { '64G/1T': 68000 },
    tradeInPrice: 37400,
  },
  {
    id: 'mac-mini-m4',
    name: 'Mac mini M4',
    category: 'Mac',
    storages: ['16G/256G'],
    colors: ['銀色'],
    launchDate: '2024-11-08',
    launchPrice: { '16G/256G': 19900 },
    basePrice: { '16G/256G': 19900 },
    marketAvg: { '16G/256G': 16500 },
    tradeInPrice: 9800,
  },
  {
    id: 'mac-mini-m4-pro',
    name: 'Mac mini M4 Pro',
    category: 'Mac',
    storages: ['24G/512G'],
    colors: ['銀色'],
    launchDate: '2024-11-08',
    launchPrice: { '24G/512G': 31900 },
    basePrice: { '24G/512G': 31900 },
    marketAvg: { '24G/512G': 26000 },
    tradeInPrice: 9800,
  },
  {
    id: 'mac-mini-m2',
    name: 'Mac mini M2',
    category: 'Mac',
    storages: ['8G/256G'],
    colors: ['銀色'],
    launchDate: '2023-01-24',
    launchPrice: { '8G/256G': 18900 },
    basePrice: { '8G/256G': 18900 },
    marketAvg: { '8G/256G': 10500 },
    tradeInPrice: 9800,
  },
  {
    id: 'mac-mini-m2-pro',
    name: 'Mac mini M2 Pro',
    category: 'Mac',
    storages: ['16G/512G'],
    colors: ['銀色'],
    launchDate: '2023-01-24',
    launchPrice: { '16G/512G': 39900 },
    basePrice: { '16G/512G': 39900 },
    marketAvg: { '16G/512G': 23500 },
    tradeInPrice: 9800,
  },
  {
    id: 'mac-mini-m1',
    name: 'Mac mini M1',
    category: 'Mac',
    storages: ['8G/256G'],
    colors: ['銀色'],
    launchDate: '2020-11-17',
    launchPrice: { '8G/256G': 21900 },
    basePrice: { '8G/256G': 21900 },
    marketAvg: { '8G/256G': 8500 },
    tradeInPrice: 9800,
  },
  {
    id: 'imac-m4',
    name: 'iMac M4',
    category: 'Mac',
    storages: ['16G/256G'],
    colors: ['藍色', '綠色', '粉紅色', '銀色', '黃色', '橙色', '紫色'],
    launchDate: '2024-11-08',
    launchPrice: { '16G/256G': 42900 },
    basePrice: { '16G/256G': 42900 },
    marketAvg: { '16G/256G': 35000 },
    tradeInPrice: 11200,
  },
  {
    id: 'imac-m3',
    name: 'iMac M3',
    category: 'Mac',
    storages: ['8G/256G'],
    colors: ['藍色', '綠色', '粉紅色', '銀色', '黃色', '橙色', '紫色'],
    launchDate: '2023-11-07',
    launchPrice: { '8G/256G': 44900 },
    basePrice: { '8G/256G': 44900 },
    marketAvg: { '8G/256G': 26000 },
    tradeInPrice: 11200,
  },
  {
    id: 'imac-m1',
    name: 'iMac M1',
    category: 'Mac',
    storages: ['8G/256G'],
    colors: ['藍色', '綠色', '粉紅色', '銀色', '黃色', '橙色', '紫色'],
    launchDate: '2021-05-21',
    launchPrice: { '8G/256G': 39900 },
    basePrice: { '8G/256G': 39900 },
    marketAvg: { '8G/256G': 17000 },
    tradeInPrice: 11200,
  },
  {
    id: 'mac-pro-m2-ultra',
    name: 'Mac Pro M2 Ultra',
    category: 'Mac',
    storages: ['64G/1T'],
    colors: ['銀色'],
    launchDate: '2023-06-13',
    launchPrice: { '64G/1T': 229900 },
    basePrice: { '64G/1T': 229900 },
    marketAvg: { '64G/1T': 120000 },
    tradeInPrice: null,
  },

  // ==================== Apple TV / HomePod ====================
  {
    id: 'apple-tv-4k-3',
    name: 'Apple TV 4K 第3代',
    category: '其他',
    storages: ['64G', '128G'],
    colors: ['黑色'],
    launchDate: '2022-11-04',
    launchPrice: { '64G': 4490, '128G': 5290 },
    basePrice: { '64G': 4490, '128G': 5290 },
    marketAvg: { '64G': 2800, '128G': 3500 },
    tradeInPrice: null,
  },
  {
    id: 'homepod-2',
    name: 'HomePod 第2代',
    category: '其他',
    storages: ['標準版'],
    colors: ['午夜色', '白色'],
    launchDate: '2023-02-03',
    launchPrice: { '標準版': 9490 },
    basePrice: { '標準版': 9490 },
    marketAvg: { '標準版': 6500 },
    tradeInPrice: null,
  },
  {
    id: 'homepod-mini',
    name: 'HomePod mini',
    category: '其他',
    storages: ['標準版'],
    colors: ['太空灰', '白色', '黃色', '橙色', '藍色'],
    launchDate: '2020-11-16',
    launchPrice: { '標準版': 3290 },
    basePrice: { '標準版': 3290 },
    marketAvg: { '標準版': 1800 },
    tradeInPrice: null,
  },
]

const currentOfficialPriceOverrides = {
  'macbook-pro-14-m5': { '16G/1T': 64900 },
  'macbook-pro-14-m5-pro': { '24G/1T': 84900 },
  'macbook-pro-14-m5-max': { '36G/2T': 160900 },
  'macbook-pro-16-m5-pro': { '24G/1T': 99900 },
  'macbook-pro-16-m5-max': { '36G/2T': 169900 },
  'macbook-air-m5-13': { '16G/512G': 42900 },
  'macbook-air-m5-15': { '16G/512G': 49900 },
  'ipad-11': { '128G': 14900, '256G': 18400, '512G': 25400 },
  'ipad-mini-7': { '128G': 19900, '256G': 23400, '512G': 30400 },
  'ipad-pro-m4-13': { '256G': 50900, '512G': 57900, '1T': 71900, '2T': 89400 },
  'ipad-pro-m4-11': { '256G': 39900, '512G': 46900, '1T': 60900, '2T': 78400 },
  'ipad-air-m3-13': { '128G': 31900, '256G': 35400, '512G': 42400, '1T': 52900 },
  'ipad-air-m3-11': { '128G': 24900, '256G': 28400, '512G': 35400, '1T': 45900 },
  'ipad-air-m2-13': { '128G': 31900, '256G': 35400, '512G': 42400, '1T': 52900 },
  'ipad-air-m2-11': { '128G': 24900, '256G': 28400, '512G': 35400, '1T': 45900 },
  'mac-mini-m4': { '16G/256G': 26900 },
  'mac-mini-m4-pro': { '24G/512G': 54900 },
  'imac-m4': { '16G/256G': 49900 },
  'mac-studio-m4-max': { '36G/512G': 84900 },
  'mac-studio-m3-ultra': { '96G/1T': 184900 },
  'apple-tv-4k-3': { '64G': 6900, '128G': 8500 },
  'homepod-2': { '標準版': 10990 },
  'homepod-mini': { '標準版': 3990 },
}

for (const product of APPLE_PRODUCTS) {
  product.currentOfficialPrice = {
    ...product.basePrice,
    ...(currentOfficialPriceOverrides[product.id] || {}),
  }
  product.officialPriceIncreased = product.storages.some(storage => {
    const launch = product.launchPrice?.[storage] ?? product.basePrice?.[storage]
    const currentOfficial = product.currentOfficialPrice?.[storage]
    return launch != null && currentOfficial != null && currentOfficial > launch
  })
}

const marketAvgOverrides = marketAdjustments?.marketAvg || {}
for (const product of APPLE_PRODUCTS) {
  const override = marketAvgOverrides[product.id]
  if (!override) continue
  product.marketAvg = { ...product.marketAvg, ...override }
  product.marketAdjusted = true
}

const MARKET_REFERENCE_DATE = new Date('2026-06-30T00:00:00+08:00')
const MAX_DISCOUNT_TIERS = [
  { months: 6, standard: 0.16, highSpec: 0.12 },
  { months: 18, standard: 0.28, highSpec: 0.24 },
  { months: 30, standard: 0.35, highSpec: 0.32 },
]

function monthsSinceLaunch(launchDate) {
  const launched = new Date(`${launchDate}T00:00:00+08:00`)
  if (Number.isNaN(launched.getTime())) return 0
  return Math.max(0, (MARKET_REFERENCE_DATE - launched) / (1000 * 60 * 60 * 24 * 30.4375))
}

function getProductLineKey(product) {
  const name = product.name || ''

  if (product.category === 'iPhone') {
    if (name.includes('Pro Max')) return 'iphone-pro-max'
    if (name.includes('Pro')) return 'iphone-pro'
    if (name.includes('Plus') || name.includes('Air')) return 'iphone-air'
    if (name.includes('e')) return 'iphone-e'
    return 'iphone'
  }

  if (product.category === 'MacBook') {
    const pro = name.match(/^MacBook Pro (13吋|14吋|16吋) M\d+(?: (Pro|Max))?/)
    if (pro) return `macbook-pro-${pro[1]}-${(pro[2] || 'base').toLowerCase()}`

    const air = name.match(/^MacBook Air (13吋|15吋)/)
    if (air) return `macbook-air-${air[1]}`

    if (name === 'MacBook Air M1') return 'macbook-air-13吋'
    return `macbook-${name}`
  }

  if (product.category === 'iPad') {
    const pro = name.match(/^iPad Pro (11吋|13吋|12\.9吋)/)
    if (pro) return pro[1] === '11吋' ? 'ipad-pro-11' : 'ipad-pro-large'

    const air = name.match(/^iPad Air (11吋|13吋)/)
    if (air) return 'ipad-air'

    if (name.startsWith('iPad mini')) return 'ipad-mini'
    if (name.startsWith('iPad Air 第')) return 'ipad-air'
    if (/^iPad 第\d+代/.test(name)) return 'ipad'
    return `ipad-${name}`
  }

  if (product.category === 'Apple Watch') {
    if (name.startsWith('Apple Watch Ultra')) return 'apple-watch-ultra'
    if (name.startsWith('Apple Watch Series')) return 'apple-watch-series'
    if (name.startsWith('Apple Watch SE')) return 'apple-watch-se'
    return `apple-watch-${name}`
  }

  if (product.category === 'AirPods') {
    if (name.startsWith('AirPods Pro')) return 'airpods-pro'
    if (name.startsWith('AirPods Max')) return 'airpods-max'
    if (name.startsWith('AirPods 4')) return 'airpods'
    return `airpods-${name}`
  }

  if (product.category === 'Mac') {
    if (name.startsWith('Mac mini')) {
      return name.includes('Pro') ? 'mac-mini-pro' : 'mac-mini'
    }
    if (name.startsWith('Mac Studio')) {
      if (name.includes('Ultra')) return 'mac-studio-ultra'
      if (name.includes('Max')) return 'mac-studio-max'
      return 'mac-studio'
    }
    if (name.startsWith('iMac')) return 'imac'
  }

  if (name.startsWith('Apple TV')) return 'apple-tv'
  if (name.startsWith('HomePod mini')) return 'homepod-mini'
  if (name.startsWith('HomePod')) return 'homepod'
  return `${product.category}-${name}`
}

function latestLaunchTimeByLine(products) {
  const result = new Map()
  for (const product of products) {
    if (!product.launchDate) continue
    const time = new Date(`${product.launchDate}T00:00:00+08:00`).getTime()
    if (Number.isNaN(time)) continue
    const key = getProductLineKey(product)
    result.set(key, Math.max(result.get(key) || 0, time))
  }
  return result
}

function ramFromStorageLabel(storage) {
  const match = String(storage || '').match(/(\d+)G\//)
  return match ? Number(match[1]) : 0
}

function isHighSpecVariant(product, storage) {
  const name = product.name || ''
  if (product.category === 'MacBook' || product.category === 'Mac') {
    if (/\bM\d+ (Pro|Max)\b/.test(name) || name.includes('Ultra')) return true
    if (ramFromStorageLabel(storage) >= 32) return true
    return /(^|\/)(1T|2T|4T|8T)$/.test(String(storage || ''))
  }

  if (product.category === 'iPad') return /^(1T|2T)$/.test(String(storage || ''))
  if (product.category === 'iPhone') return /^(1T|2T)$/.test(String(storage || ''))
  return false
}

function maxDiscountForLatestProduct(monthsOld, highSpec) {
  const tier = MAX_DISCOUNT_TIERS.find(item => monthsOld <= item.months)
  if (!tier) return null
  return highSpec ? tier.highSpec : tier.standard
}

function enforceLatestProductDiscountFloors(products) {
  const latestByLine = latestLaunchTimeByLine(products)

  for (const product of products) {
    // Apple Watch 的電池、外觀與配件狀況會造成遠大於其他品類的價差，
    // 不用新品保值下限覆蓋人工行情或真實成交基準。
    if (product.category === 'Apple Watch') continue
    if (!product.launchDate || !product.marketAvg) continue

    const launchTime = new Date(`${product.launchDate}T00:00:00+08:00`).getTime()
    const latestTime = latestByLine.get(getProductLineKey(product))
    if (!latestTime || launchTime < latestTime) continue

    const monthsOld = monthsSinceLaunch(product.launchDate)
    for (const storage of product.storages) {
      const official = product.currentOfficialPrice?.[storage] ?? product.basePrice?.[storage]
      const current = product.marketAvg?.[storage]
      if (!official || !current) continue

      const maxDiscount = maxDiscountForLatestProduct(monthsOld, isHighSpecVariant(product, storage))
      if (maxDiscount == null) continue

      const floor = toHundredFloor(official * (1 - maxDiscount))
      if (current < floor) {
        product.marketAvg[storage] = floor
        product.latestProductFloorApplied = true
      }
    }
  }
}

function firstYearIphoneDrop(productName) {
  if (productName.includes('Pro Max')) return 13000
  if (productName.includes('Pro')) return 11000
  return 8000
}

function cumulativeIphoneDrop(monthsOld, firstYearDrop) {
  const yearlyFactors = [1, 0.55, 0.35, 0.22, 0.14, 0.1]
  let remainingMonths = monthsOld
  let drop = 0

  for (const factor of yearlyFactors) {
    if (remainingMonths <= 0) break
    const monthsInYear = Math.min(12, remainingMonths)
    drop += firstYearDrop * factor * (monthsInYear / 12)
    remainingMonths -= monthsInYear
  }

  if (remainingMonths > 0) {
    drop += firstYearDrop * 0.08 * (remainingMonths / 12)
  }

  return drop
}

for (const product of APPLE_PRODUCTS) {
  if (product.category !== 'iPhone' || !product.launchDate) continue

  const monthsOld = monthsSinceLaunch(product.launchDate)
  const expectedDrop = cumulativeIphoneDrop(monthsOld, firstYearIphoneDrop(product.name))

  for (const storage of product.storages) {
    const launch = product.launchPrice?.[storage] ?? product.basePrice?.[storage]
    const current = product.marketAvg?.[storage]
    if (!launch || !current) continue

    const inferred = Math.round(Math.max(0, launch - expectedDrop) / 100) * 100
    product.marketAvg[storage] = Math.min(current, inferred)
  }
}

const MAX_NEW_PRICE_SOURCE_AGE_DAYS = 14
const isFreshNewPriceSource = source => {
  const scrapedAt = new Date(source?.meta?.scrapedAt)
  if (Number.isNaN(scrapedAt.getTime())) return false
  return (Date.now() - scrapedAt.getTime()) <= MAX_NEW_PRICE_SOURCE_AGE_DAYS * 24 * 60 * 60 * 1000
}
const newProductPriceSources = [mikoPriceCeilings, jyesPriceCeilings]
  .filter(isFreshNewPriceSource)
  .map(source => source.ceilings || {})
const toHundredFloor = price => Math.floor(price / 100) * 100
const toSecondHandCeiling = price => toHundredFloor(price * 0.95)

enforceLatestProductDiscountFloors(APPLE_PRODUCTS)

for (const product of APPLE_PRODUCTS) {
  const sourceCeilings = newProductPriceSources
    .map(source => source[product.id])
    .filter(Boolean)
  if (!sourceCeilings.length) continue

  product.newProductPriceCeiling = Object.fromEntries(
    product.storages.flatMap(storage => {
      const availablePrices = sourceCeilings
        .map(ceilings => ceilings[storage])
        .filter(Number.isFinite)
      if (!availablePrices.length) return []
      return [[storage, toSecondHandCeiling(Math.min(...availablePrices))]]
    })
  )

  for (const storage of product.storages) {
    const ceiling = product.newProductPriceCeiling[storage]
    const current = product.marketAvg?.[storage]
    if (!ceiling || !current) continue

    product.marketAvg[storage] = Math.min(current, ceiling)
  }
}

// 類別列表
export const CATEGORIES = ['全部', 'iPhone', 'MacBook', 'iPad', 'Apple Watch', 'AirPods', 'Mac', '其他']

// 成色選項
export const CONDITIONS = ['全新未拆封', '外觀完美無痕', '輕微細紋（正常使用）', '邊框有小刮痕', '背蓋有明顯刮痕', '機身有缺陷／碰傷']

// 交易方式
export const TRADE_METHODS = ['面交', '郵寄（賣家出運費）', '郵寄（買家出運費）']

// 面交地點（台灣主要城市）
export const LOCATIONS = [
  '台北市', '新北市', '基隆市', '桃園市', '新竹市', '新竹縣',
  '苗栗縣', '台中市', '彰化縣', '南投縣', '雲林縣',
  '嘉義市', '嘉義縣', '台南市', '高雄市', '屏東縣',
  '宜蘭縣', '花蓮縣', '台東縣', '澎湖縣', '金門縣',
]

// 面交捷運站（大台北地區常用）
export const MRT_STATIONS = [
  '台北車站', '板橋', '新店', '中和', '永和', '三重', '新莊',
  '蘆洲', '汐止', '松山', '信義區', '大安', '中山', '士林',
  '北投', '內湖', '南港', '景美', '木柵', '新竹火車站', '桃園火車站',
]

// 產生假成交紀錄
export function generateTransactions(productId, storage, count = 30) {
  const product = APPLE_PRODUCTS.find(p => p.id === productId)
  if (!product) return []
  const base = product.marketAvg[storage] || 10000
  return Array.from({ length: count }, (_, i) => {
    const daysAgo = Math.floor(Math.random() * 30)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    const conditionIdx = Math.floor(Math.random() * CONDITIONS.length)
    const priceMultiplier = [1.05, 1.02, 1.0, 0.97, 0.93, 0.85][conditionIdx]
    const price = Math.round((base * priceMultiplier * (0.95 + Math.random() * 0.1)) / 100) * 100
    return {
      id: i,
      date: date.toISOString().split('T')[0],
      daysAgo,
      condition: CONDITIONS[conditionIdx],
      price,
      tradeMethod: TRADE_METHODS[Math.floor(Math.random() * TRADE_METHODS.length)],
      location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
    }
  }).sort((a, b) => a.daysAgo - b.daysAgo)
}

// 購買管道
export const PURCHASE_CHANNELS = [
  'Apple 官方直購',
  'Apple 官方整新品',
  '電信門市（中華/遠傳/台哥大）',
  '授權經銷商（iStore/STUDIO A 等）',
  '蝦皮購物',
  '露天拍賣',
  'Facebook 社團',
  'LINE 群組',
  '實體二手店',
  '朋友轉讓',
  '其他',
]

// 外觀損傷選項
export const COSMETIC_CONDITIONS = [
  '無任何損傷（完美品相）',
  '輕微細紋（正常使用痕跡）',
  '背蓋有細紋',
  '邊框有碰傷',
  '螢幕有輕微刮痕',
  '螢幕有明顯刮痕',
  '機身有明顯損傷',
]

// 保固狀態
export const WARRANTY_STATUS = [
  '原廠保固內',
  '已過原廠保固',
  '延長保固（AppleCare+）',
  '不確定',
]
