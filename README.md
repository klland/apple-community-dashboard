# Apple Community Dashboard

## 啟動

```bash
npm install
npm run dev
```

## 每月自動更新價格（本機，不依賴訂閱）

### 1) 先試跑（不寫檔）

```bash
npm run price:update:monthly:dry
```

### 2) 實際更新

```bash
npm run price:update:monthly
```

更新結果會寫入：

- `src/data/marketAdjustments.json`（前端實際讀取的覆蓋價格）
- `data/monthly-price-changelog/YYYY-MM.json`（每月調整清單）

## cron（每月 1 號 10:00）

在專案根目錄執行：

```bash
crontab -e
```

加入這行：

```bash
0 10 1 * * cd /Users/klland/Documents/apple-community-dashboard && /usr/bin/env npm run price:update:monthly >> /Users/klland/Documents/apple-community-dashboard/data/monthly-price-cron.log 2>&1
```

## 真實資料接入建議

1. 將聚合後的真實行情寫到 `data/real-price-signals.json`。  
2. 格式可參考 `data/real-price-signals.example.json`。  
3. 腳本會自動把真實資料以權重混合進本月價格（資料越新、樣本越多，權重越高）。

建議只放「同型號+容量」的中位數與樣本數，不要直接放單筆成交價，噪音會低很多。
