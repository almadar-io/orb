---
id: prob
title: "Probabilistic Programming (prob/*)"
sidebar_label: "Prob"
---

# 🎲 Probabilistic Programming

> **Module:** `prob/*` | **Operators:** 16

Distribution sampling (Gaussian, Beta, Poisson), Bayesian inference via rejection sampling, and statistical summaries.

---

## Operator Reference

### `prob/seed`

**Seed PRNG** · 1 argument · returns `void`
 · ⚠️ has side effects

Sets a seeded Mulberry32 PRNG on the evaluation context. All subsequent prob/* operators use this seed for reproducible results.

| Parameter | Type | Description |
|-----------|------|-------------|
| `n` | `number` | Seed value |

```json
["prob/seed", 42]
```

### `prob/flip`

**Bernoulli Flip** · 1 argument · returns `boolean`

Returns true with probability p and false with probability (1 - p). Uses Box-Muller PRNG if seeded.

| Parameter | Type | Description |
|-----------|------|-------------|
| `p` | `number` | Probability (0.0 to 1.0) |

```json
["prob/flip", 0.7] // => true ~70% of the time
```

### `prob/gaussian`

**Gaussian Sample** · 2 arguments · returns `number`

Samples from a normal (Gaussian) distribution using the Box-Muller transform.

| Parameter | Type | Description |
|-----------|------|-------------|
| `mu` | `number` | Mean |
| `sigma` | `number` | Standard deviation |

```json
["prob/gaussian", 0, 1] // => standard normal sample
```

### `prob/uniform`

**Uniform Sample** · 2 arguments · returns `number`

Samples uniformly from the half-open interval [lo, hi).

| Parameter | Type | Description |
|-----------|------|-------------|
| `lo` | `number` | Lower bound (inclusive) |
| `hi` | `number` | Upper bound (exclusive) |

```json
["prob/uniform", 0, 1] // => value in [0, 1)
```

### `prob/beta`

**Beta Sample** · 2 arguments · returns `number`

Samples from a Beta distribution using the Marsaglia-Tsang gamma variate method.

| Parameter | Type | Description |
|-----------|------|-------------|
| `alpha` | `number` | Shape parameter α &gt; 0 |
| `beta` | `number` | Shape parameter β &gt; 0 |

```json
["prob/beta", 2, 5] // => value in (0, 1), mean ≈ 0.286
```

### `prob/categorical`

**Categorical Sample** · 2 arguments · returns `any`

Selects an item from a weighted categorical distribution.

| Parameter | Type | Description |
|-----------|------|-------------|
| `items` | `array` | Array of items to sample from |
| `weights` | `number[]` | Non-negative weights (need not sum to 1) |

```json
["prob/categorical", ["a", "b", "c"], [1, 2, 1]] // => "b" ~50%
```

### `prob/poisson`

**Poisson Sample** · 1 argument · returns `integer`

Samples from a Poisson distribution using Knuth's algorithm.

| Parameter | Type | Description |
|-----------|------|-------------|
| `lambda` | `number` | Rate parameter λ &gt; 0 |

```json
["prob/poisson", 4] // => integer, mean ≈ 4
```

### `prob/condition`

**Condition** · 1 argument · returns `void`
 · ⚠️ has side effects

Used inside inference models. If the predicate is false, marks the current sample as rejected.

| Parameter | Type | Description |
|-----------|------|-------------|
| `predicate` | `boolean` | Condition that must hold for the sample to be accepted |

```json
["prob/condition", [">", "@entity.x", 5]]
```

### `prob/sample`

**Sample** · 2 arguments · returns `array`

Evaluates an expression n times and returns the results as an array. The expression argument is lazy.

| Parameter | Type | Description |
|-----------|------|-------------|
| `n` | `number` | Number of samples |
| `expr` | `expression` | Expression to evaluate (lazy) |

```json
["prob/sample", 1000, ["prob/flip", 0.5]]
```

### `prob/posterior`

**Posterior** · 4 arguments · returns `array`

Runs rejection sampling: evaluates model, applies evidence condition, collects query values. Returns accepted query values as an array.

| Parameter | Type | Description |
|-----------|------|-------------|
| `model` | `expression` | Model expression that sets entity fields (lazy) |
| `evidence` | `expression` | Boolean evidence condition (lazy) |
| `query` | `expression` | Value to collect from accepted samples (lazy) |
| `n` | `number` | Number of simulation runs |

```json
["prob/posterior", model, evidence, "@entity.x", 5000]
```

### `prob/infer`

**Infer** · 4 arguments · returns `{ mean, variance, samples, acceptRate }`

Like prob/posterior but returns a summary object instead of raw samples.

| Parameter | Type | Description |
|-----------|------|-------------|
| `model` | `expression` | Model expression (lazy) |
| `evidence` | `expression` | Boolean evidence condition (lazy) |
| `query` | `expression` | Value to summarize (lazy) |
| `n` | `number` | Number of simulation runs |

```json
["prob/infer", model, evidence, "@entity.x", 5000]
```

### `prob/expected-value`

**Expected Value** · 1 argument · returns `number`

Computes the arithmetic mean of a numeric array.

| Parameter | Type | Description |
|-----------|------|-------------|
| `samples` | `number[]` | Array of numeric samples |

```json
["prob/expected-value", [1, 2, 3, 4]] // => 2.5
```

### `prob/variance`

**Variance** · 1 argument · returns `number`

Computes the population variance of a numeric array.

| Parameter | Type | Description |
|-----------|------|-------------|
| `samples` | `number[]` | Array of numeric samples |

```json
["prob/variance", [2, 4, 4, 4, 5, 5, 7, 9]] // => 4
```

### `prob/histogram`

**Histogram** · 2 arguments · returns `{ binEdges: number[], counts: number[] }`

Bins samples into a histogram.

| Parameter | Type | Description |
|-----------|------|-------------|
| `samples` | `number[]` | Numeric samples |
| `bins` | `number` | Number of bins |

```json
["prob/histogram", samples, 10]
```

### `prob/percentile`

**Percentile** · 2 arguments · returns `number`

Returns the value at the given percentile (0-100) of a sorted sample array.

| Parameter | Type | Description |
|-----------|------|-------------|
| `samples` | `number[]` | Numeric samples |
| `p` | `number` | Percentile (0 to 100) |

```json
["prob/percentile", samples, 50] // => median
```

### `prob/credible-interval`

**Credible Interval** · 2 arguments · returns `[number, number]`

Returns a (1 - alpha) credible interval [lo, hi] from sorted samples.

| Parameter | Type | Description |
|-----------|------|-------------|
| `samples` | `number[]` | Numeric samples |
| `alpha` | `number` | Significance level (e.g. 0.05 for 95% CI) |

```json
["prob/credible-interval", samples, 0.05] // => 95% CI
```
