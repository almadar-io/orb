export interface PlaygroundExample {
  id: string;
  label: string;
  category: string;
  code: string;
  description: string;
}

export const PLAYGROUND_EXAMPLES: PlaygroundExample[] = [
  // ─── Core ──────────────────────────────────────────────────────────────
  {
    id: "arithmetic",
    label: "Arithmetic",
    category: "Core",
    description: "Basic arithmetic with nested s-expressions",
    code: `["+", 10, ["*", 3, 4]]`,
  },
  {
    id: "conditional",
    label: "Conditional (if)",
    category: "Core",
    description: "Conditional expression returning different values",
    code: `["if", [">", 7, 5], "seven is greater", "five is greater"]`,
  },
  {
    id: "do-block",
    label: "Do block",
    category: "Core",
    description: "Sequence of expressions — returns the last value",
    code: `["do",
  ["set", "@entity.x", 10],
  ["set", "@entity.y", 20],
  ["+", "@entity.x", "@entity.y"]
]`,
  },

  // ─── Math ──────────────────────────────────────────────────────────────
  {
    id: "math-clamp",
    label: "math/clamp",
    category: "Math",
    description: "Clamp a value between min and max",
    code: `["math/clamp", 150, 0, 100]`,
  },
  {
    id: "math-round",
    label: "math/round",
    category: "Math",
    description: "Round to N decimal places",
    code: `["math/round", 3.14159, 2]`,
  },

  // ─── Strings ───────────────────────────────────────────────────────────
  {
    id: "str-template",
    label: "str/template",
    category: "Strings",
    description: "String interpolation with named variables",
    code: `["str/template", "Hello, {{name}}! You have {{count}} messages.", {
  "name": "Alice",
  "count": 5
}]`,
  },
  {
    id: "str-split-join",
    label: "str/split + array/join",
    category: "Strings",
    description: "Split a string into an array, then join with a new separator",
    code: `["array/join",
  ["str/split", "one,two,three", ","],
  " | "
]`,
  },

  // ─── Arrays ────────────────────────────────────────────────────────────
  {
    id: "array-filter-map",
    label: "array/filter + array/map",
    category: "Arrays",
    description: "Filter even numbers then square each",
    code: `["array/map",
  ["array/filter",
    [1, 2, 3, 4, 5, 6],
    ["fn", ["x"], ["=", ["%", "@x", 2], 0]]
  ],
  ["fn", ["x"], ["*", "@x", "@x"]]
]`,
  },
  {
    id: "array-reduce",
    label: "array/reduce",
    category: "Arrays",
    description: "Sum an array using reduce",
    code: `["array/reduce",
  [1, 2, 3, 4, 5],
  ["fn", ["acc", "x"], ["+", "@acc", "@x"]],
  0
]`,
  },

  // ─── Time ──────────────────────────────────────────────────────────────
  {
    id: "time-format",
    label: "time/format",
    category: "Time",
    description: "Format a timestamp as a readable date",
    code: `["time/format", ["time/now"], "YYYY-MM-DD"]`,
  },

  // ─── Probabilistic ─────────────────────────────────────────────────────
  {
    id: "prob-flip",
    label: "prob/flip",
    category: "Probabilistic",
    description: "Bernoulli flip — true with 70% probability",
    code: `["prob/flip", 0.7]`,
  },
  {
    id: "prob-gaussian",
    label: "prob/gaussian",
    category: "Probabilistic",
    description: "Sample from a normal distribution (mean=0, σ=1)",
    code: `["prob/gaussian", 0, 1]`,
  },
  {
    id: "prob-sample",
    label: "prob/sample",
    category: "Probabilistic",
    description: "Draw 10 samples from a Gaussian distribution",
    code: `["prob/sample", 10, ["prob/gaussian", 5, 2]]`,
  },
  {
    id: "prob-infer",
    label: "prob/infer (Bayesian)",
    category: "Probabilistic",
    description: "Tug-of-war inference: given Alice > Bob, what is Alice's strength?",
    code: `["prob/infer",
  ["do",
    ["set", "@entity.alice", ["prob/gaussian", 10, 3]],
    ["set", "@entity.bob",   ["prob/gaussian", 10, 3]]
  ],
  [">", "@entity.alice", "@entity.bob"],
  "@entity.alice",
  1000
]`,
  },
  {
    id: "prob-stats",
    label: "prob/expected-value + credible-interval",
    category: "Probabilistic",
    description: "Sample 500 values, compute mean and 90% credible interval",
    code: `["do",
  ["set", "@entity.samples", ["prob/sample", 500, ["prob/gaussian", 5, 2]]],
  ["set", "@entity.mean",    ["prob/expected-value", "@entity.samples"]],
  ["set", "@entity.ci",      ["prob/credible-interval", "@entity.samples", 0.1]],
  {
    "mean": "@entity.mean",
    "ci90": "@entity.ci"
  }
]`,
  },
];

export const EXAMPLE_CATEGORIES = [
  ...new Set(PLAYGROUND_EXAMPLES.map((e) => e.category)),
];
