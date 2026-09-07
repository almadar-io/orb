---
title: "التاريخ والوقت (time/*)"
sidebar_label: "الوقت"
---

# التاريخ والوقت

> **الوحدة:** `time/*` | **العوامل:** 25

العمل مع التواريخ والأوقات والمدد والطوابع الزمنية.

---

## مرجع العوامل

### `time/now`
**الآن** · 0 وسائط · يُعيد `number`
```json
["time/now"] // => 1705593600000
```

### `time/today`
**اليوم** · 0 وسائط · يُعيد `number`

اليوم عند منتصف الليل (التوقيت المحلي)
```json
["time/today"]
```

### `time/parse`
**تحليل** · 1-2 وسائط · يُعيد `number`
```json
["time/parse", "2024-01-18", "YYYY-MM-DD"]
```

### `time/format`
**تنسيق** · وسيطان · يُعيد `string`
```json
["time/format", "@entity.createdAt", "MMM DD, YYYY"]
```

### `time/year`
**السنة** · وسيط واحد · يُعيد `number`
```json
["time/year", "@entity.createdAt"] // => 2024
```

### `time/month`
**الشهر** · وسيط واحد · يُعيد `number` (1-12)
```json
["time/month", "@entity.createdAt"] // => 1
```

### `time/day`
**اليوم** · وسيط واحد · يُعيد `number` (1-31)
```json
["time/day", "@entity.createdAt"] // => 18
```

### `time/weekday`
**يوم الأسبوع** · وسيط واحد · يُعيد `number` (0=الأحد، 6=السبت)
```json
["time/weekday", "@entity.createdAt"] // => 4 (الخميس)
```

### `time/hour`
**الساعة** · وسيط واحد · يُعيد `number` (0-23)
```json
["time/hour", "@entity.createdAt"] // => 14
```

### `time/minute`
**الدقيقة** · وسيط واحد · يُعيد `number` (0-59)
```json
["time/minute", "@entity.createdAt"] // => 30
```

### `time/second`
**الثانية** · وسيط واحد · يُعيد `number` (0-59)
```json
["time/second", "@entity.createdAt"] // => 45
```

### `time/add`
**إضافة** · 3 وسائط · يُعيد `number`

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `date` | `number` | الطابع الزمني |
| `amount` | `number` | المقدار المُضاف |
| `unit` | `string` | وحدة الوقت (year/month/week/day/hour/minute/second/ms) |

```json
["time/add", ["time/now"], 7, "day"]
```

### `time/subtract`
**طرح** · 3 وسائط · يُعيد `number`
```json
["time/subtract", ["time/now"], 1, "hour"]
```

### `time/diff`
**الفرق** · 2-3 وسائط · يُعيد `number`
```json
["time/diff", "@entity.birthDate", ["time/now"], "year"]
```

### `time/startOf`
**بداية الفترة** · وسيطان · يُعيد `number`
```json
["time/startOf", ["time/now"], "month"]
```

### `time/endOf`
**نهاية الفترة** · وسيطان · يُعيد `number`
```json
["time/endOf", ["time/now"], "month"]
```

### `time/isBefore`
**قبل** · وسيطان · يُعيد `boolean`
```json
["time/isBefore", "@entity.startDate", "@entity.endDate"]
```

### `time/isAfter`
**بعد** · وسيطان · يُعيد `boolean`
```json
["time/isAfter", ["time/now"], "@entity.deadline"]
```

### `time/isBetween`
**بين** · 3 وسائط · يُعيد `boolean`
```json
["time/isBetween", ["time/now"], "@entity.startDate", "@entity.endDate"]
```

### `time/isSame`
**مطابق** · 2-3 وسائط · يُعيد `boolean`
```json
["time/isSame", "@a", "@b", "day"]
```

### `time/isPast`
**في الماضي** · وسيط واحد · يُعيد `boolean`
```json
["time/isPast", "@entity.expiresAt"]
```

### `time/isFuture`
**في المستقبل** · وسيط واحد · يُعيد `boolean`
```json
["time/isFuture", "@entity.scheduledAt"]
```

### `time/isToday`
**اليوم** · وسيط واحد · يُعيد `boolean`
```json
["time/isToday", "@entity.createdAt"]
```

### `time/relative`
**نسبي** · وسيط واحد · يُعيد `string`

تنسيق كوقت نسبي ("منذ ساعتين"، "بعد 3 أيام")
```json
["time/relative", "@entity.lastActivityAt"] // => "2 hours ago"
```

### `time/duration`
**مدة** · وسيط واحد · يُعيد `string`

تنسيق المللي ثانية كمدة ("2h 30m")
```json
["time/duration", 9000000] // => "2h 30m"
```
