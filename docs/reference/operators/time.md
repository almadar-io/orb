---
id: time
title: "Date & Time (time/*)"
sidebar_label: "Time"
---

# ⏰ Date & Time

> **Module:** `time/*` | **Operators:** 25

Work with dates, times, durations, and timestamps.

---

## Operator Reference

### `time/now`

**Now** · 0 arguments · returns `number`

Current timestamp

```lolo
(time/now) // => 1705593600000
```

### `time/today`

**Today** · 0 arguments · returns `number`

Today at midnight (local time)

```lolo
(time/today)
```

### `time/parse`

**Parse** · 1–2 arguments · returns `number`

Parse string to timestamp

| Parameter | Type | Description |
|-----------|------|-------------|
| `str` | `string` | Date string |
| `format` | `string` | Format pattern |

```lolo
(time/parse "2024-01-18" "YYYY-MM-DD")
```

### `time/format`

**Format** · 2 arguments · returns `string`

Format timestamp to string

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `number` | Timestamp |
| `format` | `string` | Format pattern |

```lolo
(time/format "@entity.createdAt" "MMM DD, YYYY")
```

### `time/year`

**Year** · 1 argument · returns `number`

Get year from timestamp

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `number` | Timestamp |

```lolo
(time/year "@entity.createdAt") // => 2024
```

### `time/month`

**Month** · 1 argument · returns `number`

Get month from timestamp (1-12)

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `number` | Timestamp |

```lolo
(time/month "@entity.createdAt") // => 1
```

### `time/day`

**Day** · 1 argument · returns `number`

Get day of month from timestamp (1-31)

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `number` | Timestamp |

```lolo
(time/day "@entity.createdAt") // => 18
```

### `time/weekday`

**Weekday** · 1 argument · returns `number`

Get day of week (0=Sunday, 6=Saturday)

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `number` | Timestamp |

```lolo
(time/weekday "@entity.createdAt") // => 4 (Thursday)
```

### `time/hour`

**Hour** · 1 argument · returns `number`

Get hour from timestamp (0-23)

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `number` | Timestamp |

```lolo
(time/hour "@entity.createdAt") // => 14
```

### `time/minute`

**Minute** · 1 argument · returns `number`

Get minute from timestamp (0-59)

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `number` | Timestamp |

```lolo
(time/minute "@entity.createdAt") // => 30
```

### `time/second`

**Second** · 1 argument · returns `number`

Get second from timestamp (0-59)

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `number` | Timestamp |

```lolo
(time/second "@entity.createdAt") // => 45
```

### `time/add`

**Add** · 3 arguments · returns `number`

Add time to timestamp

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `number` | Timestamp |
| `amount` | `number` | Amount to add |
| `unit` | `string` | Time unit (year/month/week/day/hour/minute/second/ms) |

```lolo
(time/add (time/now) 7 "day")
```

### `time/subtract`

**Subtract** · 3 arguments · returns `number`

Subtract time from timestamp

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `number` | Timestamp |
| `amount` | `number` | Amount to subtract |
| `unit` | `string` | Time unit |

```lolo
(time/subtract (time/now) 1 "hour")
```

### `time/diff`

**Diff** · 2–3 arguments · returns `number`

Difference between timestamps

| Parameter | Type | Description |
|-----------|------|-------------|
| `a` | `number` | First timestamp |
| `b` | `number` | Second timestamp |
| `unit` | `string` | Result unit |

```lolo
(time/diff "@entity.birthDate" (time/now) "year")
```

### `time/startOf`

**Start Of** · 2 arguments · returns `number`

Get start of time period

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `number` | Timestamp |
| `unit` | `string` | Time unit (year/month/week/day/hour/minute) |

```lolo
(time/startOf (time/now) "month")
```

### `time/endOf`

**End Of** · 2 arguments · returns `number`

Get end of time period

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `number` | Timestamp |
| `unit` | `string` | Time unit |

```lolo
(time/endOf (time/now) "month")
```

### `time/isBefore`

**Is Before** · 2 arguments · returns `boolean`

Check if a is before b

| Parameter | Type | Description |
|-----------|------|-------------|
| `a` | `number` | First timestamp |
| `b` | `number` | Second timestamp |

```lolo
(time/isBefore "@entity.startDate" "@entity.endDate")
```

### `time/isAfter`

**Is After** · 2 arguments · returns `boolean`

Check if a is after b

| Parameter | Type | Description |
|-----------|------|-------------|
| `a` | `number` | First timestamp |
| `b` | `number` | Second timestamp |

```lolo
(time/isAfter (time/now) "@entity.deadline")
```

### `time/isBetween`

**Is Between** · 3 arguments · returns `boolean`

Check if date is between start and end

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `number` | Timestamp to check |
| `start` | `number` | Range start |
| `end` | `number` | Range end |

```lolo
(time/isBetween (time/now) "@entity.startDate" "@entity.endDate")
```

### `time/isSame`

**Is Same** · 2–3 arguments · returns `boolean`

Check if timestamps are same (optionally by unit)

| Parameter | Type | Description |
|-----------|------|-------------|
| `a` | `number` | First timestamp |
| `b` | `number` | Second timestamp |
| `unit` | `string` | Comparison unit |

```lolo
(time/isSame "@a" "@b" "day")
```

### `time/isPast`

**Is Past Date** · 1 argument · returns `boolean`

Check if timestamp is in the past

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `number` | Timestamp |

```lolo
(time/isPast "@entity.expiresAt")
```

### `time/isFuture`

**Is Future Date** · 1 argument · returns `boolean`

Check if timestamp is in the future

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `number` | Timestamp |

```lolo
(time/isFuture "@entity.scheduledAt")
```

### `time/isToday`

**Is Today** · 1 argument · returns `boolean`

Check if timestamp is today

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `number` | Timestamp |

```lolo
(time/isToday "@entity.createdAt")
```

### `time/relative`

**Relative** · 1 argument · returns `string`

Format as relative time ("2 hours ago", "in 3 days")

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `number` | Timestamp |

```lolo
(time/relative "@entity.lastActivityAt") // => "2 hours ago"
```

### `time/duration`

**Duration** · 1 argument · returns `string`

Format milliseconds as duration ("2h 30m")

| Parameter | Type | Description |
|-----------|------|-------------|
| `ms` | `number` | Duration in milliseconds |

```lolo
(time/duration 9000000) // => "2h 30m"
```
