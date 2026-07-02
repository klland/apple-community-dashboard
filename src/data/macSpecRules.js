const HUNDRED = 100

function roundHundred(value) {
  return Math.round(value / HUNDRED) * HUNDRED
}

function floorHundred(value) {
  return Math.floor(value / HUNDRED) * HUNDRED
}

const airRules = [
  {
    when: { ram: ['24G', '32G'] },
    set: { gpu: '10-core' },
    message: '24G 以上記憶體需搭配 10 核心 GPU',
  },
]

const proRules = [
  {
    when: { ram: ['48G'] },
    set: { chipVariant: 'high' },
    message: '48G 記憶體需搭配高階 M5 Pro 晶片',
  },
]

const maxRules = [
  {
    when: { ram: ['48G', '64G'] },
    set: { chipVariant: 'high' },
    message: '48G 以上記憶體需搭配 40 核心 GPU 的 M5 Max',
  },
]

function makeAirConfig({ id, chipLabel = 'M5', baseStorage, baseSsd, baseMarketLabel }) {
  return {
    id,
    mode: 'air',
    baseStorage,
    baseMarketLabel,
    source: 'Apple 台灣 MacBook Air 購買頁',
    baseSpec: { gpu: '8-core', ram: '16G', ssd: baseSsd },
    groups: [
      {
        key: 'gpu',
        label: '晶片 / GPU',
        options: [
          { value: '8-core', label: `${chipLabel} / 8 核心 GPU` },
          { value: '10-core', label: `${chipLabel} / 10 核心 GPU` },
        ],
      },
      {
        key: 'ram',
        label: '記憶體',
        options: [
          { value: '16G', label: '16G' },
          { value: '24G', label: '24G' },
          { value: '32G', label: '32G' },
        ],
      },
      {
        key: 'ssd',
        label: 'SSD',
        options: [
          { value: baseSsd, label: baseSsd },
          { value: '1T', label: '1T' },
          { value: '2T', label: '2T' },
        ],
      },
    ],
    addons: {
      gpu: {
        '10-core': { label: '10 核心 GPU', market: 1200, retail: 3000 },
      },
      ram: {
        '24G': { label: '24G 記憶體', market: 2500, retail: 7000 },
        '32G': { label: '32G 記憶體', market: 5200, retail: 14000 },
      },
      ssd: {
        '1T': { label: '1T SSD', market: baseSsd === '1T' ? 0 : 3000, retail: baseSsd === '1T' ? 0 : 7000 },
        '2T': { label: '2T SSD', market: 6500, retail: baseSsd === '1T' ? 7000 : 14000 },
      },
    },
    rules: airRules,
  }
}

function makeLegacyAirConfig({ id, chipLabel, baseStorage, baseRam, baseSsd, baseMarketLabel, maxRam = '16G' }) {
  const ramOptions = baseRam === '16G'
    ? ['16G', '24G']
    : ['8G', '16G']
  if (maxRam === '24G' && !ramOptions.includes('24G')) ramOptions.push('24G')

  return {
    id,
    mode: 'air-legacy',
    baseStorage,
    baseMarketLabel,
    source: 'Apple Silicon MacBook Air 常見二手規格',
    baseSpec: { chipVariant: 'base', ram: baseRam, ssd: baseSsd },
    groups: [
      {
        key: 'chipVariant',
        label: '晶片',
        options: [{ value: 'base', label: chipLabel }],
      },
      {
        key: 'ram',
        label: '記憶體',
        options: ramOptions.map(value => ({ value, label: value })),
      },
      {
        key: 'ssd',
        label: 'SSD',
        options: ['256G', '512G', '1T', '2T']
          .filter(value => value === baseSsd || value !== '256G' || baseSsd === '256G')
          .map(value => ({ value, label: value })),
      },
    ],
    addons: {
      ram: {
        '16G': { label: '16G 記憶體', market: baseRam === '16G' ? 0 : 2200, retail: baseRam === '16G' ? 0 : 6000 },
        '24G': { label: '24G 記憶體', market: 4300, retail: 12000 },
      },
      ssd: {
        '512G': { label: '512G SSD', market: baseSsd === '512G' ? 0 : 1700, retail: baseSsd === '512G' ? 0 : 6000 },
        '1T': { label: '1T SSD', market: baseSsd === '1T' ? 0 : 3600, retail: baseSsd === '1T' ? 0 : 12000 },
        '2T': { label: '2T SSD', market: 7200, retail: 24000 },
      },
    },
    rules: [],
  }
}

function makeLegacyProConfig({ id, chipLabel, baseStorage, baseRam, baseSsd, baseMarketLabel, ramOptions }) {
  return {
    id,
    mode: 'pro-legacy',
    baseStorage,
    baseMarketLabel,
    source: 'Apple Silicon MacBook Pro 常見二手規格',
    baseSpec: { chipVariant: 'base', ram: baseRam, ssd: baseSsd },
    groups: [
      {
        key: 'chipVariant',
        label: '晶片',
        options: [{ value: 'base', label: chipLabel }],
      },
      {
        key: 'ram',
        label: '記憶體',
        options: ramOptions.map(value => ({ value, label: value })),
      },
      {
        key: 'ssd',
        label: 'SSD',
        options: ['512G', '1T', '2T', '4T'].map(value => ({ value, label: value })),
      },
    ],
    addons: {
      ram: {
        '16G': { label: '16G 記憶體', market: baseRam === '16G' ? 0 : 2400, retail: baseRam === '16G' ? 0 : 7000 },
        '24G': { label: '24G 記憶體', market: 3200, retail: 10000 },
        '32G': { label: '32G 記憶體', market: 5200, retail: 16000 },
        '36G': { label: '36G 記憶體', market: 6400, retail: 18000 },
        '48G': { label: '48G 記憶體', market: 8600, retail: 28000 },
        '64G': { label: '64G 記憶體', market: 12000, retail: 42000 },
        '96G': { label: '96G 記憶體', market: 18500, retail: 56000 },
        '128G': { label: '128G 記憶體', market: 26000, retail: 84000 },
      },
      ssd: {
        '1T': { label: '1T SSD', market: baseSsd === '1T' ? 0 : 3500, retail: baseSsd === '1T' ? 0 : 10000 },
        '2T': { label: '2T SSD', market: baseSsd === '2T' ? 0 : 7200, retail: baseSsd === '2T' ? 0 : 24000 },
        '4T': { label: '4T SSD', market: 16000, retail: 54000 },
      },
    },
    rules: [],
  }
}

function makeDesktopConfig({ id, productLine, chipOptions, chipAddons = {}, baseStorage, baseRam, baseSsd, baseMarketLabel, ramOptions, ssdOptions }) {
  return {
    id,
    mode: 'desktop',
    baseStorage,
    baseMarketLabel,
    source: `${productLine} 常見二手規格`,
    baseSpec: { chipVariant: chipOptions[0].value, ram: baseRam, ssd: baseSsd },
    groups: [
      {
        key: 'chipVariant',
        label: '晶片',
        options: chipOptions,
      },
      {
        key: 'ram',
        label: '記憶體',
        options: ramOptions.map(value => ({ value, label: value })),
      },
      {
        key: 'ssd',
        label: 'SSD',
        options: ssdOptions.map(value => ({ value, label: value })),
      },
    ],
    addons: {
      chipVariant: {
        high: { label: '高階晶片', market: 5000, retail: 12000 },
        ultra: { label: 'Ultra 晶片', market: 18000, retail: 50000 },
        ...chipAddons,
      },
      ram: {
        '24G': { label: '24G 記憶體', market: 2800, retail: 8000 },
        '32G': { label: '32G 記憶體', market: 5200, retail: 14000 },
        '36G': { label: '36G 記憶體', market: 6200, retail: 16000 },
        '48G': { label: '48G 記憶體', market: 8500, retail: 26000 },
        '64G': { label: '64G 記憶體', market: 12000, retail: 40000 },
        '96G': { label: '96G 記憶體', market: 18500, retail: 60000 },
        '128G': { label: '128G 記憶體', market: 26000, retail: 85000 },
      },
      ssd: {
        '512G': { label: '512G SSD', market: baseSsd === '512G' ? 0 : 1800, retail: baseSsd === '512G' ? 0 : 6000 },
        '1T': { label: '1T SSD', market: baseSsd === '1T' ? 0 : 3800, retail: baseSsd === '1T' ? 0 : 12000 },
        '2T': { label: '2T SSD', market: baseSsd === '2T' ? 0 : 7800, retail: baseSsd === '2T' ? 0 : 24000 },
        '4T': { label: '4T SSD', market: 16500, retail: 54000 },
        '8T': { label: '8T SSD', market: 34000, retail: 108000 },
        '16T': { label: '16T SSD', market: 68000, retail: 216000 },
      },
    },
    rules: [],
  }
}

export const MAC_SPEC_CONFIGS = {
  'macbook-neo-13': makeLegacyAirConfig({
    id: 'macbook-neo-13',
    chipLabel: 'Neo / 入門晶片',
    baseStorage: '8G/256G',
    baseRam: '8G',
    baseSsd: '256G',
    baseMarketLabel: '8G / 256G 入門基準',
    maxRam: '16G',
  }),
  'macbook-air-m5-13': makeAirConfig({
    id: 'macbook-air-m5-13',
    baseStorage: '16G/512G',
    baseSsd: '512G',
    baseMarketLabel: '16G / 512G 低配基準',
  }),
  'macbook-air-m5-15': makeAirConfig({
    id: 'macbook-air-m5-15',
    baseStorage: '16G/512G',
    baseSsd: '512G',
    baseMarketLabel: '16G / 512G 低配基準',
  }),
  'macbook-air-m4-13': makeAirConfig({
    id: 'macbook-air-m4-13',
    chipLabel: 'M4',
    baseStorage: '16G/256G',
    baseSsd: '256G',
    baseMarketLabel: '16G / 256G 低配基準',
  }),
  'macbook-air-m4-15': makeAirConfig({
    id: 'macbook-air-m4-15',
    chipLabel: 'M4',
    baseStorage: '16G/256G',
    baseSsd: '256G',
    baseMarketLabel: '16G / 256G 低配基準',
  }),
  'macbook-air-m3-13': makeLegacyAirConfig({
    id: 'macbook-air-m3-13',
    chipLabel: 'M3',
    baseStorage: '8G/256G',
    baseRam: '8G',
    baseSsd: '256G',
    baseMarketLabel: '8G / 256G 低配基準',
    maxRam: '24G',
  }),
  'macbook-air-m3-15': makeLegacyAirConfig({
    id: 'macbook-air-m3-15',
    chipLabel: 'M3',
    baseStorage: '8G/256G',
    baseRam: '8G',
    baseSsd: '256G',
    baseMarketLabel: '8G / 256G 低配基準',
    maxRam: '24G',
  }),
  'macbook-air-m2-13': makeLegacyAirConfig({
    id: 'macbook-air-m2-13',
    chipLabel: 'M2',
    baseStorage: '8G/256G',
    baseRam: '8G',
    baseSsd: '256G',
    baseMarketLabel: '8G / 256G 低配基準',
    maxRam: '24G',
  }),
  'macbook-air-m2-15': makeLegacyAirConfig({
    id: 'macbook-air-m2-15',
    chipLabel: 'M2',
    baseStorage: '8G/256G',
    baseRam: '8G',
    baseSsd: '256G',
    baseMarketLabel: '8G / 256G 低配基準',
    maxRam: '24G',
  }),
  'macbook-air-m1': makeLegacyAirConfig({
    id: 'macbook-air-m1',
    chipLabel: 'M1',
    baseStorage: '8G/256G',
    baseRam: '8G',
    baseSsd: '256G',
    baseMarketLabel: '8G / 256G 低配基準',
    maxRam: '16G',
  }),
  'macbook-pro-14-m4': makeLegacyProConfig({
    id: 'macbook-pro-14-m4',
    chipLabel: 'M4 / 10C CPU / 10C GPU',
    baseStorage: '16G/512G',
    baseRam: '16G',
    baseSsd: '512G',
    baseMarketLabel: 'M4 / 16G / 512G 基準',
    ramOptions: ['16G', '24G', '32G'],
  }),
  'macbook-pro-14-m3': makeLegacyProConfig({
    id: 'macbook-pro-14-m3',
    chipLabel: 'M3 / 8C CPU / 10C GPU',
    baseStorage: '8G/512G',
    baseRam: '8G',
    baseSsd: '512G',
    baseMarketLabel: 'M3 / 8G / 512G 基準',
    ramOptions: ['8G', '16G', '24G'],
  }),
  'macbook-pro-14-m3-pro': makeLegacyProConfig({
    id: 'macbook-pro-14-m3-pro',
    chipLabel: 'M3 Pro',
    baseStorage: '18G/512G',
    baseRam: '18G',
    baseSsd: '512G',
    baseMarketLabel: 'M3 Pro / 18G / 512G 基準',
    ramOptions: ['18G', '36G'],
  }),
  'macbook-pro-14-m3-max': makeLegacyProConfig({
    id: 'macbook-pro-14-m3-max',
    chipLabel: 'M3 Max',
    baseStorage: '36G/1T',
    baseRam: '36G',
    baseSsd: '1T',
    baseMarketLabel: 'M3 Max / 36G / 1T 基準',
    ramOptions: ['36G', '48G', '64G', '96G', '128G'],
  }),
  'macbook-pro-14-m4-max': makeLegacyProConfig({
    id: 'macbook-pro-14-m4-max',
    chipLabel: 'M4 Max',
    baseStorage: '36G/1T',
    baseRam: '36G',
    baseSsd: '1T',
    baseMarketLabel: 'M4 Max / 36G / 1T 基準',
    ramOptions: ['36G', '48G', '64G', '128G'],
  }),
  'macbook-pro-16-m3-pro': makeLegacyProConfig({
    id: 'macbook-pro-16-m3-pro',
    chipLabel: 'M3 Pro',
    baseStorage: '18G/512G',
    baseRam: '18G',
    baseSsd: '512G',
    baseMarketLabel: 'M3 Pro / 18G / 512G 基準',
    ramOptions: ['18G', '36G'],
  }),
  'macbook-pro-16-m3-max': makeLegacyProConfig({
    id: 'macbook-pro-16-m3-max',
    chipLabel: 'M3 Max',
    baseStorage: '36G/1T',
    baseRam: '36G',
    baseSsd: '1T',
    baseMarketLabel: 'M3 Max / 36G / 1T 基準',
    ramOptions: ['36G', '48G', '64G', '96G', '128G'],
  }),
  'macbook-pro-16-m4-max': makeLegacyProConfig({
    id: 'macbook-pro-16-m4-max',
    chipLabel: 'M4 Max',
    baseStorage: '36G/1T',
    baseRam: '36G',
    baseSsd: '1T',
    baseMarketLabel: 'M4 Max / 36G / 1T 基準',
    ramOptions: ['36G', '48G', '64G', '128G'],
  }),
  'macbook-pro-14-m2-pro': makeLegacyProConfig({
    id: 'macbook-pro-14-m2-pro',
    chipLabel: 'M2 Pro',
    baseStorage: '16G/512G',
    baseRam: '16G',
    baseSsd: '512G',
    baseMarketLabel: 'M2 Pro / 16G / 512G 基準',
    ramOptions: ['16G', '32G'],
  }),
  'macbook-pro-14-m2-max': makeLegacyProConfig({
    id: 'macbook-pro-14-m2-max',
    chipLabel: 'M2 Max',
    baseStorage: '32G/1T',
    baseRam: '32G',
    baseSsd: '1T',
    baseMarketLabel: 'M2 Max / 32G / 1T 基準',
    ramOptions: ['32G', '64G', '96G'],
  }),
  'macbook-pro-16-m2-pro': makeLegacyProConfig({
    id: 'macbook-pro-16-m2-pro',
    chipLabel: 'M2 Pro',
    baseStorage: '16G/512G',
    baseRam: '16G',
    baseSsd: '512G',
    baseMarketLabel: 'M2 Pro / 16G / 512G 基準',
    ramOptions: ['16G', '32G'],
  }),
  'macbook-pro-16-m2-max': makeLegacyProConfig({
    id: 'macbook-pro-16-m2-max',
    chipLabel: 'M2 Max',
    baseStorage: '32G/1T',
    baseRam: '32G',
    baseSsd: '1T',
    baseMarketLabel: 'M2 Max / 32G / 1T 基準',
    ramOptions: ['32G', '64G', '96G'],
  }),
  'macbook-pro-13-m2': makeLegacyProConfig({
    id: 'macbook-pro-13-m2',
    chipLabel: 'M2',
    baseStorage: '8G/256G',
    baseRam: '8G',
    baseSsd: '256G',
    baseMarketLabel: 'M2 / 8G / 256G 基準',
    ramOptions: ['8G', '16G', '24G'],
  }),
  'macbook-pro-14-m4-pro': makeLegacyProConfig({
    id: 'macbook-pro-14-m4-pro',
    chipLabel: 'M4 Pro',
    baseStorage: '24G/512G',
    baseRam: '24G',
    baseSsd: '512G',
    baseMarketLabel: 'M4 Pro / 24G / 512G 基準',
    ramOptions: ['24G', '48G'],
  }),
  'macbook-pro-16-m4-pro': makeLegacyProConfig({
    id: 'macbook-pro-16-m4-pro',
    chipLabel: 'M4 Pro',
    baseStorage: '24G/512G',
    baseRam: '24G',
    baseSsd: '512G',
    baseMarketLabel: 'M4 Pro / 24G / 512G 基準',
    ramOptions: ['24G', '48G'],
  }),
  'macbook-pro-m1-14': makeLegacyProConfig({
    id: 'macbook-pro-m1-14',
    chipLabel: 'M1 Pro',
    baseStorage: '16G/512G',
    baseRam: '16G',
    baseSsd: '512G',
    baseMarketLabel: 'M1 Pro / 16G / 512G 基準',
    ramOptions: ['16G', '32G'],
  }),
  'macbook-pro-14-m1-max': makeLegacyProConfig({
    id: 'macbook-pro-14-m1-max',
    chipLabel: 'M1 Max',
    baseStorage: '32G/1T',
    baseRam: '32G',
    baseSsd: '1T',
    baseMarketLabel: 'M1 Max / 32G / 1T 基準',
    ramOptions: ['32G', '64G'],
  }),
  'macbook-pro-m1-16': makeLegacyProConfig({
    id: 'macbook-pro-m1-16',
    chipLabel: 'M1 Pro',
    baseStorage: '16G/512G',
    baseRam: '16G',
    baseSsd: '512G',
    baseMarketLabel: 'M1 Pro / 16G / 512G 基準',
    ramOptions: ['16G', '32G'],
  }),
  'macbook-pro-16-m1-max': makeLegacyProConfig({
    id: 'macbook-pro-16-m1-max',
    chipLabel: 'M1 Max',
    baseStorage: '32G/1T',
    baseRam: '32G',
    baseSsd: '1T',
    baseMarketLabel: 'M1 Max / 32G / 1T 基準',
    ramOptions: ['32G', '64G'],
  }),
  'macbook-pro-13-m1': makeLegacyProConfig({
    id: 'macbook-pro-13-m1',
    chipLabel: 'M1',
    baseStorage: '8G/256G',
    baseRam: '8G',
    baseSsd: '256G',
    baseMarketLabel: 'M1 / 8G / 256G 基準',
    ramOptions: ['8G', '16G'],
  }),
  'macbook-pro-14-m5': {
    id: 'macbook-pro-14-m5',
    mode: 'pro',
    baseStorage: '16G/1T',
    baseMarketLabel: 'M5 / 16G / 1T 基準',
    source: 'Apple 台灣 MacBook Pro 購買頁',
    baseSpec: { chipVariant: 'base', ram: '16G', ssd: '1T' },
    groups: [
      {
        key: 'chipVariant',
        label: '晶片',
        options: [{ value: 'base', label: 'M5 / 10C CPU / 10C GPU' }],
      },
      {
        key: 'ram',
        label: '記憶體',
        options: [
          { value: '16G', label: '16G' },
          { value: '24G', label: '24G' },
          { value: '32G', label: '32G' },
        ],
      },
      {
        key: 'ssd',
        label: 'SSD',
        options: [
          { value: '1T', label: '1T' },
          { value: '2T', label: '2T' },
          { value: '4T', label: '4T' },
        ],
      },
    ],
    addons: {
      ram: {
        '24G': { label: '24G 記憶體', market: 2800, retail: 7000 },
        '32G': { label: '32G 記憶體', market: 5800, retail: 14000 },
      },
      ssd: {
        '2T': { label: '2T SSD', market: 6500, retail: 14000 },
        '4T': { label: '4T SSD', market: 14500, retail: 42000 },
      },
    },
    rules: [],
  },
  'macbook-pro-14-m5-pro': {
    id: 'macbook-pro-14-m5-pro',
    mode: 'pro',
    baseStorage: '24G/1T',
    baseMarketLabel: 'M5 Pro / 24G / 1T 基準',
    source: 'Apple 台灣 MacBook Pro 購買頁',
    baseSpec: { chipVariant: 'base', ram: '24G', ssd: '1T' },
    groups: [
      {
        key: 'chipVariant',
        label: '晶片',
        options: [
          { value: 'base', label: 'M5 Pro / 15C CPU / 16C GPU' },
          { value: 'high', label: 'M5 Pro / 18C CPU / 20C GPU' },
        ],
      },
      {
        key: 'ram',
        label: '記憶體',
        options: [
          { value: '24G', label: '24G' },
          { value: '48G', label: '48G' },
        ],
      },
      {
        key: 'ssd',
        label: 'SSD',
        options: [
          { value: '1T', label: '1T' },
          { value: '2T', label: '2T' },
          { value: '4T', label: '4T' },
        ],
      },
    ],
    addons: {
      chipVariant: {
        high: { label: '高階 M5 Pro 晶片', market: 4200, retail: 10000 },
      },
      ram: {
        '48G': { label: '48G 記憶體', market: 7600, retail: 21000 },
      },
      ssd: {
        '2T': { label: '2T SSD', market: 6500, retail: 14000 },
        '4T': { label: '4T SSD', market: 14500, retail: 42000 },
      },
    },
    rules: proRules,
  },
  'macbook-pro-16-m5-pro': {
    id: 'macbook-pro-16-m5-pro',
    mode: 'pro',
    baseStorage: '24G/1T',
    baseMarketLabel: 'M5 Pro / 24G / 1T 基準',
    source: 'Apple 台灣 MacBook Pro 購買頁',
    baseSpec: { chipVariant: 'high', ram: '24G', ssd: '1T' },
    groups: [
      {
        key: 'chipVariant',
        label: '晶片',
        options: [{ value: 'high', label: 'M5 Pro / 18C CPU / 20C GPU' }],
      },
      {
        key: 'ram',
        label: '記憶體',
        options: [
          { value: '24G', label: '24G' },
          { value: '48G', label: '48G' },
        ],
      },
      {
        key: 'ssd',
        label: 'SSD',
        options: [
          { value: '1T', label: '1T' },
          { value: '2T', label: '2T' },
          { value: '4T', label: '4T' },
        ],
      },
    ],
    addons: {
      ram: {
        '48G': { label: '48G 記憶體', market: 7600, retail: 21000 },
      },
      ssd: {
        '2T': { label: '2T SSD', market: 6500, retail: 14000 },
        '4T': { label: '4T SSD', market: 14500, retail: 42000 },
      },
    },
    rules: [],
  },
  'macbook-pro-14-m5-max': {
    id: 'macbook-pro-14-m5-max',
    mode: 'max',
    baseStorage: '36G/2T',
    baseMarketLabel: 'M5 Max / 36G / 2T 基準',
    source: 'Apple 台灣 MacBook Pro 購買頁',
    baseSpec: { chipVariant: 'base', ram: '36G', ssd: '2T' },
    groups: [
      {
        key: 'chipVariant',
        label: '晶片',
        options: [
          { value: 'base', label: 'M5 Max / 18C CPU / 32C GPU' },
          { value: 'high', label: 'M5 Max / 18C CPU / 40C GPU' },
        ],
      },
      {
        key: 'ram',
        label: '記憶體',
        options: [
          { value: '36G', label: '36G' },
          { value: '48G', label: '48G' },
          { value: '64G', label: '64G' },
        ],
      },
      {
        key: 'ssd',
        label: 'SSD',
        options: [
          { value: '2T', label: '2T' },
          { value: '4T', label: '4T' },
          { value: '8T', label: '8T' },
        ],
      },
    ],
    addons: {
      chipVariant: {
        high: { label: '40 核心 GPU M5 Max', market: 5200, retail: 12000 },
      },
      ram: {
        '48G': { label: '48G 記憶體', market: 5200, retail: 14000 },
        '64G': { label: '64G 記憶體', market: 9800, retail: 28000 },
      },
      ssd: {
        '4T': { label: '4T SSD', market: 14500, retail: 42000 },
        '8T': { label: '8T SSD', market: 32000, retail: 84000 },
      },
    },
    rules: maxRules,
  },
  'macbook-pro-16-m5-max': {
    id: 'macbook-pro-16-m5-max',
    mode: 'max',
    baseStorage: '36G/2T',
    baseMarketLabel: 'M5 Max / 36G / 2T 基準',
    source: 'Apple 台灣 MacBook Pro 購買頁',
    baseSpec: { chipVariant: 'base', ram: '36G', ssd: '2T' },
    groups: [
      {
        key: 'chipVariant',
        label: '晶片',
        options: [
          { value: 'base', label: 'M5 Max / 18C CPU / 32C GPU' },
          { value: 'high', label: 'M5 Max / 18C CPU / 40C GPU' },
        ],
      },
      {
        key: 'ram',
        label: '記憶體',
        options: [
          { value: '36G', label: '36G' },
          { value: '48G', label: '48G' },
          { value: '64G', label: '64G' },
        ],
      },
      {
        key: 'ssd',
        label: 'SSD',
        options: [
          { value: '2T', label: '2T' },
          { value: '4T', label: '4T' },
          { value: '8T', label: '8T' },
        ],
      },
    ],
    addons: {
      chipVariant: {
        high: { label: '40 核心 GPU M5 Max', market: 5200, retail: 12000 },
      },
      ram: {
        '48G': { label: '48G 記憶體', market: 5200, retail: 14000 },
        '64G': { label: '64G 記憶體', market: 9800, retail: 28000 },
      },
      ssd: {
        '4T': { label: '4T SSD', market: 14500, retail: 42000 },
        '8T': { label: '8T SSD', market: 32000, retail: 84000 },
      },
    },
    rules: maxRules,
  },
  'mac-mini-m4': makeDesktopConfig({
    id: 'mac-mini-m4',
    productLine: 'Mac mini M4',
    chipOptions: [{ value: 'base', label: 'M4' }],
    baseStorage: '16G/256G',
    baseRam: '16G',
    baseSsd: '256G',
    baseMarketLabel: 'M4 / 16G / 256G 基準',
    ramOptions: ['16G', '24G', '32G'],
    ssdOptions: ['256G', '512G', '1T', '2T'],
  }),
  'mac-mini-m4-pro': makeDesktopConfig({
    id: 'mac-mini-m4-pro',
    productLine: 'Mac mini M4 Pro',
    chipOptions: [
      { value: 'base', label: 'M4 Pro' },
      { value: 'high', label: '高階 M4 Pro' },
    ],
    baseStorage: '24G/512G',
    baseRam: '24G',
    baseSsd: '512G',
    baseMarketLabel: 'M4 Pro / 24G / 512G 基準',
    ramOptions: ['24G', '48G', '64G'],
    ssdOptions: ['512G', '1T', '2T', '4T'],
  }),
  'mac-mini-m2': makeDesktopConfig({
    id: 'mac-mini-m2',
    productLine: 'Mac mini M2',
    chipOptions: [{ value: 'base', label: 'M2' }],
    baseStorage: '8G/256G',
    baseRam: '8G',
    baseSsd: '256G',
    baseMarketLabel: 'M2 / 8G / 256G 基準',
    ramOptions: ['8G', '16G', '24G'],
    ssdOptions: ['256G', '512G', '1T', '2T'],
  }),
  'mac-mini-m2-pro': makeDesktopConfig({
    id: 'mac-mini-m2-pro',
    productLine: 'Mac mini M2 Pro',
    chipOptions: [
      { value: 'base', label: 'M2 Pro' },
      { value: 'high', label: '高階 M2 Pro' },
    ],
    baseStorage: '16G/512G',
    baseRam: '16G',
    baseSsd: '512G',
    baseMarketLabel: 'M2 Pro / 16G / 512G 基準',
    ramOptions: ['16G', '32G'],
    ssdOptions: ['512G', '1T', '2T', '4T'],
  }),
  'mac-mini-m1': makeDesktopConfig({
    id: 'mac-mini-m1',
    productLine: 'Mac mini M1',
    chipOptions: [{ value: 'base', label: 'M1' }],
    baseStorage: '8G/256G',
    baseRam: '8G',
    baseSsd: '256G',
    baseMarketLabel: 'M1 / 8G / 256G 基準',
    ramOptions: ['8G', '16G'],
    ssdOptions: ['256G', '512G', '1T', '2T'],
  }),
  'imac-m4': makeDesktopConfig({
    id: 'imac-m4',
    productLine: 'iMac M4',
    chipOptions: [
      { value: 'base', label: 'M4 / 8 核心 GPU' },
      { value: 'high', label: 'M4 / 10 核心 GPU' },
    ],
    baseStorage: '16G/256G',
    baseRam: '16G',
    baseSsd: '256G',
    baseMarketLabel: 'M4 / 16G / 256G 基準',
    ramOptions: ['16G', '24G', '32G'],
    ssdOptions: ['256G', '512G', '1T', '2T'],
  }),
  'imac-m3': makeDesktopConfig({
    id: 'imac-m3',
    productLine: 'iMac M3',
    chipOptions: [
      { value: 'base', label: 'M3 / 8 核心 GPU' },
      { value: 'high', label: 'M3 / 10 核心 GPU' },
    ],
    baseStorage: '8G/256G',
    baseRam: '8G',
    baseSsd: '256G',
    baseMarketLabel: 'M3 / 8G / 256G 基準',
    ramOptions: ['8G', '16G', '24G'],
    ssdOptions: ['256G', '512G', '1T', '2T'],
  }),
  'imac-m1': makeDesktopConfig({
    id: 'imac-m1',
    productLine: 'iMac M1',
    chipOptions: [
      { value: 'base', label: 'M1 / 7 核心 GPU' },
      { value: 'high', label: 'M1 / 8 核心 GPU' },
    ],
    baseStorage: '8G/256G',
    baseRam: '8G',
    baseSsd: '256G',
    baseMarketLabel: 'M1 / 8G / 256G 基準',
    ramOptions: ['8G', '16G'],
    ssdOptions: ['256G', '512G', '1T', '2T'],
  }),
  'mac-studio-m4-max': makeDesktopConfig({
    id: 'mac-studio-m4-max',
    productLine: 'Mac Studio M4 Max',
    chipOptions: [
      { value: 'base', label: 'M4 Max / 14C CPU / 32C GPU' },
      { value: 'high', label: 'M4 Max / 16C CPU / 40C GPU' },
    ],
    baseStorage: '36G/512G',
    baseRam: '36G',
    baseSsd: '512G',
    baseMarketLabel: 'M4 Max / 36G / 512G 基準',
    ramOptions: ['36G', '64G'],
    ssdOptions: ['512G', '1T', '2T', '4T', '8T'],
  }),
  'mac-studio-m2-max': makeDesktopConfig({
    id: 'mac-studio-m2-max',
    productLine: 'Mac Studio M2 Max',
    chipOptions: [
      { value: 'base', label: 'M2 Max / 30 核心 GPU' },
      { value: 'high', label: 'M2 Max / 38 核心 GPU' },
    ],
    baseStorage: '32G/512G',
    baseRam: '32G',
    baseSsd: '512G',
    baseMarketLabel: 'M2 Max / 32G / 512G 基準',
    ramOptions: ['32G', '64G', '96G'],
    ssdOptions: ['512G', '1T', '2T', '4T', '8T'],
  }),
  'mac-studio-m2-ultra': makeDesktopConfig({
    id: 'mac-studio-m2-ultra',
    productLine: 'Mac Studio M2 Ultra',
    chipOptions: [
      { value: 'base', label: 'M2 Ultra / 60 核心 GPU' },
      { value: 'high', label: 'M2 Ultra / 76 核心 GPU' },
    ],
    chipAddons: {
      high: { label: '76 核心 GPU M2 Ultra', market: 12000, retail: 30000 },
    },
    baseStorage: '64G/1T',
    baseRam: '64G',
    baseSsd: '1T',
    baseMarketLabel: 'M2 Ultra / 64G / 1T 基準',
    ramOptions: ['64G', '128G', '192G'],
    ssdOptions: ['1T', '2T', '4T', '8T'],
  }),
  'mac-studio-m1-max': makeDesktopConfig({
    id: 'mac-studio-m1-max',
    productLine: 'Mac Studio M1 Max',
    chipOptions: [
      { value: 'base', label: 'M1 Max / 24 核心 GPU' },
      { value: 'high', label: 'M1 Max / 32 核心 GPU' },
    ],
    baseStorage: '32G/512G',
    baseRam: '32G',
    baseSsd: '512G',
    baseMarketLabel: 'M1 Max / 32G / 512G 基準',
    ramOptions: ['32G', '64G'],
    ssdOptions: ['512G', '1T', '2T', '4T', '8T'],
  }),
  'mac-studio-m1-ultra': makeDesktopConfig({
    id: 'mac-studio-m1-ultra',
    productLine: 'Mac Studio M1 Ultra',
    chipOptions: [
      { value: 'base', label: 'M1 Ultra / 48 核心 GPU' },
      { value: 'high', label: 'M1 Ultra / 64 核心 GPU' },
    ],
    chipAddons: {
      high: { label: '64 核心 GPU M1 Ultra', market: 10000, retail: 30000 },
    },
    baseStorage: '64G/1T',
    baseRam: '64G',
    baseSsd: '1T',
    baseMarketLabel: 'M1 Ultra / 64G / 1T 基準',
    ramOptions: ['64G', '128G'],
    ssdOptions: ['1T', '2T', '4T', '8T'],
  }),
  'mac-studio-m3-ultra': makeDesktopConfig({
    id: 'mac-studio-m3-ultra',
    productLine: 'Mac Studio M3 Ultra',
    chipOptions: [
      { value: 'base', label: 'M3 Ultra / 28C CPU / 60C GPU' },
      { value: 'high', label: 'M3 Ultra / 32C CPU / 80C GPU' },
    ],
    chipAddons: {
      high: { label: '80 核心 GPU M3 Ultra', market: 18000, retail: 50000 },
    },
    baseStorage: '96G/1T',
    baseRam: '96G',
    baseSsd: '1T',
    baseMarketLabel: 'M3 Ultra / 96G / 1T 基準',
    ramOptions: ['96G'],
    ssdOptions: ['1T', '2T', '4T', '8T', '16T'],
  }),
  'mac-pro-m2-ultra': makeDesktopConfig({
    id: 'mac-pro-m2-ultra',
    productLine: 'Mac Pro M2 Ultra',
    chipOptions: [
      { value: 'base', label: 'M2 Ultra / 60 核心 GPU' },
      { value: 'high', label: 'M2 Ultra / 76 核心 GPU' },
    ],
    chipAddons: {
      high: { label: '76 核心 GPU M2 Ultra', market: 12000, retail: 30000 },
    },
    baseStorage: '64G/1T',
    baseRam: '64G',
    baseSsd: '1T',
    baseMarketLabel: 'M2 Ultra / 64G / 1T 基準',
    ramOptions: ['64G', '128G', '192G'],
    ssdOptions: ['1T', '2T', '4T', '8T'],
  }),
}

export function getMacSpecConfig(productId) {
  return MAC_SPEC_CONFIGS[productId] ?? null
}

export function getDefaultMacSpec(config) {
  return config ? { ...config.baseSpec } : null
}

function matchesRule(spec, rule) {
  return Object.entries(rule.when || {}).every(([key, values]) => values.includes(spec[key]))
}

export function normalizeMacSpec(config, spec) {
  if (!config || !spec) return spec
  let next = { ...config.baseSpec, ...spec }
  let changed = true

  while (changed) {
    changed = false
    for (const rule of config.rules || []) {
      if (!matchesRule(next, rule)) continue
      for (const [key, value] of Object.entries(rule.set || {})) {
        if (next[key] !== value) {
          next = { ...next, [key]: value }
          changed = true
        }
      }
    }
  }

  return next
}

export function getMacRuleMessages(config, spec) {
  if (!config || !spec) return []
  return (config.rules || [])
    .filter(rule => matchesRule(spec, rule))
    .map(rule => rule.message)
}

export function isMacOptionDisabled(config, spec, key, value) {
  if (!config || !spec) return false
  const candidate = { ...spec, [key]: value }
  const normalized = normalizeMacSpec(config, candidate)
  return normalized[key] !== value
}

export function estimateMacSpec({ config, spec, baseMarket, baseRetail }) {
  if (!config || !spec || baseMarket == null) return null

  const normalized = normalizeMacSpec(config, spec)
  const rows = []
  let marketAddOn = 0
  let retailAddOn = 0

  for (const [key, value] of Object.entries(normalized)) {
    if (config.baseSpec[key] === value) continue
    const addon = config.addons?.[key]?.[value]
    if (!addon) continue
    marketAddOn += addon.market || 0
    retailAddOn += addon.retail || 0
    rows.push({
      key,
      label: addon.label,
      market: addon.market || 0,
      retail: addon.retail || 0,
    })
  }

  const estimatedRetail = baseRetail != null ? baseRetail + retailAddOn : null
  const newProductGuardrail = estimatedRetail ? floorHundred(estimatedRetail * 0.95) : null
  const estimatedBeforeCap = roundHundred(baseMarket + marketAddOn)
  const estimatedMarket = newProductGuardrail
    ? Math.min(estimatedBeforeCap, newProductGuardrail)
    : estimatedBeforeCap

  return {
    spec: normalized,
    rows,
    baseMarket,
    baseRetail,
    marketAddOn: roundHundred(marketAddOn),
    retailAddOn,
    estimatedBeforeCap,
    estimatedMarket,
    estimatedRetail,
    newProductGuardrail,
    capped: newProductGuardrail != null && estimatedBeforeCap > newProductGuardrail,
  }
}
