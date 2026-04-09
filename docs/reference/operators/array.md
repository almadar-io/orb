---
id: array
title: "Collection Operations (array/*)"
sidebar_label: "Array"
---

# 📋 Collection Operations

> **Module:** `array/*` | **Operators:** 39

Work with lists and arrays including filtering, mapping, and aggregation.

---

## Operator Reference

### `array/len`

**Length** · 1 argument · returns `number`

Array length

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |

```lolo
(array/len [1 2 3]) // => 3
```

### `array/empty?`

**Empty?** · 1 argument · returns `boolean`

Check if array is empty

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |

```lolo
(array/empty? []) // => true
```

### `array/first`

**First** · 1 argument · returns `any`

Get first element

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |

```lolo
(array/first [1 2 3]) // => 1
```

### `array/last`

**Last** · 1 argument · returns `any`

Get last element

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |

```lolo
(array/last [1 2 3]) // => 3
```

### `array/nth`

**Nth** · 2 arguments · returns `any`

Get element at index

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `index` | `number` | Index (0-based) |

```lolo
(array/nth [1 2 3] 1) // => 2
```

### `array/slice`

**Slice** · 2–3 arguments · returns `array`

Extract subarray

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `start` | `number` | Start index |
| `end` | `number` | End index (exclusive) |

```lolo
(array/slice [1 2 3 4] 1 3) // => [2, 3]
```

### `array/concat`

**Concat** · 2 or more · returns `array`

Concatenate arrays

| Parameter | Type | Description |
|-----------|------|-------------|
| `...arrs` | `array[]` | Arrays to concatenate |

```lolo
(array/concat [1 2] [3 4]) // => [1, 2, 3, 4]
```

### `array/append`

**Append** · 2 arguments · returns `array`

Add item to end (returns new array)

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `item` | `any` | Item to add |

```lolo
(array/append [1 2] 3) // => [1, 2, 3]
```

### `array/prepend`

**Prepend** · 2 arguments · returns `array`

Add item to start (returns new array)

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `item` | `any` | Item to add |

```lolo
(array/prepend [2 3] 1) // => [1, 2, 3]
```

### `array/insert`

**Insert** · 3 arguments · returns `array`

Insert item at index (returns new array)

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `index` | `number` | Index to insert at |
| `item` | `any` | Item to insert |

```lolo
(array/insert [1 3] 1 2) // => [1, 2, 3]
```

### `array/remove`

**Remove** · 2 arguments · returns `array`

Remove item at index (returns new array)

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `index` | `number` | Index to remove |

```lolo
(array/remove [1 2 3] 1) // => [1, 3]
```

### `array/removeItem`

**Remove Item** · 2 arguments · returns `array`

Remove first matching item (returns new array)

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `item` | `any` | Item to remove |

```lolo
(array/removeItem [1 2 3 2] 2) // => [1, 3, 2]
```

### `array/reverse`

**Reverse** · 1 argument · returns `array`

Reverse array order (returns new array)

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |

```lolo
(array/reverse [1 2 3]) // => [3, 2, 1]
```

### `array/sort`

**Sort** · 1–3 arguments · returns `array`

Sort array (returns new array)

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `key` | `string` | Field to sort by (for objects) |
| `dir` | `string` | "asc" or "desc" |

```lolo
(array/sort "@items" "price" "desc")
```

### `array/shuffle`

**Shuffle** · 1 argument · returns `array`

Randomly shuffle array (returns new array)

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |

```lolo
(array/shuffle [1 2 3 4 5])
```

### `array/unique`

**Unique** · 1 argument · returns `array`

Remove duplicates (returns new array)

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |

```lolo
(array/unique [1 2 2 3 1]) // => [1, 2, 3]
```

### `array/flatten`

**Flatten** · 1 argument · returns `array`

Flatten nested arrays one level

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |

```lolo
(array/flatten [[1 2] [3 4]]) // => [1, 2, 3, 4]
```

### `array/zip`

**Zip** · 2 arguments · returns `array`

Pair elements from two arrays

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr1` | `array` | First array |
| `arr2` | `array` | Second array |

```lolo
(array/zip [1 2] (a "b")) // => [[1, "a"], [2, "b"]]
```

### `array/includes`

**Includes** · 2 arguments · returns `boolean`

Check if array contains item

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `item` | `any` | Item to find |

```lolo
(array/includes [1 2 3] 2) // => true
```

### `array/indexOf`

**Index Of** · 2 arguments · returns `number`

Find index of item (-1 if not found)

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `item` | `any` | Item to find |

```lolo
(array/indexOf [1 2 3] 2) // => 1
```

### `array/find`

**Find** · 2 arguments · returns `any`

Find first element matching predicate

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `pred` | `lambda` | Predicate function |

```lolo
(array/find "@items" (fn "x" (= "@x.status" "active")))
```

### `array/findIndex`

**Find Index** · 2 arguments · returns `number`

Find index of first element matching predicate (-1 if none)

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `pred` | `lambda` | Predicate function |

```lolo
(array/findIndex "@items" (fn "x" (= "@x.status" "active")))
```

### `array/filter`

**Filter** · 2 arguments · returns `array`

Keep elements matching predicate

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `pred` | `lambda` | Predicate function |

```lolo
(array/filter "@items" (fn "x" (> "@x.price" 100)))
```

### `array/reject`

**Reject** · 2 arguments · returns `array`

Remove elements matching predicate

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `pred` | `lambda` | Predicate function |

```lolo
(array/reject "@items" (fn "x" (= "@x.status" "deleted")))
```

### `array/map`

**Map** · 2 arguments · returns `array`

Transform each element

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `fn` | `lambda` | Transform function |

```lolo
(array/map "@items" (fn "x" (* "@x.price" 1.1)))
```

### `array/reduce`

**Reduce** · 3 arguments · returns `any`

Reduce array to single value

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `fn` | `lambda` | Reducer function (acc, item) =&gt; newAcc |
| `init` | `any` | Initial accumulator value |

```lolo
(array/reduce "@items" (fn (acc "x") (+ "@acc" "@x.price")) 0)
```

### `array/every`

**Every** · 2 arguments · returns `boolean`

Check if all elements match predicate

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `pred` | `lambda` | Predicate function |

```lolo
(array/every "@items" (fn "x" (> "@x.price" 0)))
```

### `array/some`

**Some** · 2 arguments · returns `boolean`

Check if any element matches predicate

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `pred` | `lambda` | Predicate function |

```lolo
(array/some "@items" (fn "x" (= "@x.status" "active")))
```

### `array/count`

**Count** · 1–2 arguments · returns `number`

Count elements (optionally matching predicate)

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `pred` | `lambda` | Predicate function |

```lolo
(array/count "@tasks" (fn "t" (= "@t.status" "done")))
```

### `array/sum`

**Sum** · 1–2 arguments · returns `number`

Sum values (optionally by field)

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `key` | `string` | Field to sum |

```lolo
(array/sum "@cart.items" "price")
```

### `array/avg`

**Avg** · 1–2 arguments · returns `number`

Average of values (optionally by field)

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `key` | `string` | Field to average |

```lolo
(array/avg "@ratings" "score")
```

### `array/min`

**Min** · 1–2 arguments · returns `number`

Minimum value (optionally by field)

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `key` | `string` | Field to compare |

```lolo
(array/min "@products" "price")
```

### `array/max`

**Max** · 1–2 arguments · returns `number`

Maximum value (optionally by field)

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `key` | `string` | Field to compare |

```lolo
(array/max "@products" "price")
```

### `array/groupBy`

**Group By** · 2 arguments · returns `any`

Group elements by field value

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `key` | `string` | Field to group by |

```lolo
(array/groupBy "@orders" "status")
```

### `array/partition`

**Partition** · 2 arguments · returns `array`

Split array by predicate into [matches, nonMatches]

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `pred` | `lambda` | Predicate function |

```lolo
(array/partition "@items" (fn "x" (> "@x.price" 50)))
```

### `array/take`

**Take** · 2 arguments · returns `array`

Take first n elements

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `n` | `number` | Number of elements |

```lolo
(array/take "@items" 5)
```

### `array/drop`

**Drop** · 2 arguments · returns `array`

Skip first n elements

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `n` | `number` | Number of elements to skip |

```lolo
(array/drop "@items" 5)
```

### `array/takeLast`

**Take Last** · 2 arguments · returns `array`

Take last n elements

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `n` | `number` | Number of elements |

```lolo
(array/takeLast "@items" 3)
```

### `array/dropLast`

**Drop Last** · 2 arguments · returns `array`

Skip last n elements

| Parameter | Type | Description |
|-----------|------|-------------|
| `arr` | `array` | The array |
| `n` | `number` | Number of elements to skip |

```lolo
(array/dropLast "@items" 2)
```
