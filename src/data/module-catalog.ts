export const MODULE_CATALOG: Record<string, Record<string, { description: string; example: string; returnType: string }>> = {
  "core": {
    "core/add": {
      "description": "Addition: a + b (supports multiple args)",
      "example": "[\"+\", 10, 20, 30] // => 60",
      "returnType": "number"
    },
    "core/subtract": {
      "description": "Subtraction: a - b",
      "example": "[\"-\", 100, 37] // => 63",
      "returnType": "number"
    },
    "core/multiply": {
      "description": "Multiplication: a * b",
      "example": "[\"*\", 7, 8] // => 56",
      "returnType": "number"
    },
    "core/divide": {
      "description": "Division: a / b",
      "example": "[\"/\", 355, 113] // => 3.1415929203539825",
      "returnType": "number"
    },
    "core/modulo": {
      "description": "Modulo (remainder): a % b",
      "example": "[\"%\", 17, 5] // => 2",
      "returnType": "number"
    },
    "core/equal": {
      "description": "Equality comparison: a = b",
      "example": "[\"=\", 42, 42] // => true",
      "returnType": "boolean"
    },
    "core/not-equal": {
      "description": "Inequality comparison: a != b",
      "example": "[\"!=\", 1, 2] // => true",
      "returnType": "boolean"
    },
    "core/less-than": {
      "description": "Less than: a < b",
      "example": "[\"<\", 3, 7] // => true",
      "returnType": "boolean"
    },
    "core/greater-than": {
      "description": "Greater than: a > b",
      "example": "[\">\", 10, 5] // => true",
      "returnType": "boolean"
    },
    "core/less-equal": {
      "description": "Less than or equal: a <= b",
      "example": "[\"<=\", 5, 5] // => true",
      "returnType": "boolean"
    },
    "core/greater-equal": {
      "description": "Greater than or equal: a >= b",
      "example": "[\">=\", 10, 3] // => true",
      "returnType": "boolean"
    },
    "core/and": {
      "description": "Logical AND (short-circuits)",
      "example": "[\"and\", true, true, true] // => true",
      "returnType": "boolean"
    },
    "core/or": {
      "description": "Logical OR (short-circuits)",
      "example": "[\"or\", false, false, true] // => true",
      "returnType": "boolean"
    },
    "core/not": {
      "description": "Logical NOT",
      "example": "[\"not\", false] // => true",
      "returnType": "boolean"
    },
    "core/if": {
      "description": "Conditional: if(cond, then, else)",
      "example": "[\"if\", [\">\", 10, 5], \"big\", \"small\"] // => big",
      "returnType": "any"
    },
    "core/if-nested": {
      "description": "Nested conditionals for multi-way branching",
      "example": "[\"if\", [\">\", 85, 90], \"A\", [\"if\", [\">\", 85, 80], \"B\", \"C\"]] // => B",
      "returnType": "any"
    },
    "core/let": {
      "description": "Local variable bindings: let([[name, value], ...], body)",
      "example": "[\"let\", [[\"x\", 10], [\"y\", 20]], [\"+\", \"@x\", \"@y\"]] // => 30",
      "returnType": "any"
    },
    "core/let-computed": {
      "description": "Let with computed bindings referencing earlier bindings",
      "example": "[\"let\", [[\"a\", 5]], [\"let\", [[\"b\", [\"*\", \"@a\", 2]]], [\"+\", \"@a\", \"@b\"]]] // => 15",
      "returnType": "any"
    },
    "core/do": {
      "description": "Sequence block: evaluate expressions, return last result",
      "example": "[\"do\", [\"+\", 1, 2], [\"*\", 3, 4], [\"-\", 100, 1]] // => 99",
      "returnType": "any"
    },
    "core/when": {
      "description": "Conditional execution: when(cond, effect). No else branch.",
      "example": "[\"when\", [\">\", 10, 5], [\"str/concat\", \"triggered\", \"!\"]] // => triggered!",
      "returnType": "void"
    },
    "core/fn-map": {
      "description": "Lambda with array/map: transform each element",
      "example": "[\"array/map\", [1, 2, 3, 4, 5], [\"fn\", \"x\", [\"*\", \"@x\", \"@x\"]]] // => [1,4,9,16,25]",
      "returnType": "array"
    },
    "core/fn-filter": {
      "description": "Lambda with array/filter: keep elements matching predicate",
      "example": "[\"array/filter\", [1, 2, 3, 4, 5, 6], [\"fn\", \"x\", [\"=\", [\"%\", \"@x\", 2], 0]]] // => [2,4,6]",
      "returnType": "array"
    },
    "core/fn-reduce": {
      "description": "Lambda with array/reduce: fold array to single value (multi-param fn)",
      "example": "[\"array/reduce\", [1, 2, 3, 4], 0, [\"fn\", [\"acc\", \"x\"], [\"+\", \"@acc\", [\"*\", \"@x\", \"@x\"]]]] // => 30",
      "returnType": "any"
    },
    "core/fn-find": {
      "description": "Lambda with array/find: find first element matching predicate",
      "example": "[\"array/find\", [10, 20, 30, 40], [\"fn\", \"x\", [\">\", \"@x\", 25]]] // => 30",
      "returnType": "any"
    },
    "core/pipeline": {
      "description": "Chained operations: map then filter then reduce",
      "example": "[\"array/reduce\", [\"array/filter\", [\"array/map\", [1, 2, 3, 4, 5], [\"fn\", \"x\", [\"*\", \"@x\", 10]]], [\"fn\", \"x\", [\">\", \"@x\", 25]]], 0, [\"fn\", [\"acc\", \"x\"], [\"+\", \"@acc\", \"@x\"]]] // => 120",
      "returnType": "any"
    },
    "core/let-fn": {
      "description": "Let + fn: bind data, then transform with lambda",
      "example": "[\"let\", [[\"data\", [\"str/split\", \"a,b,c,d\", \",\"]]], [\"array/map\", \"@data\", [\"fn\", \"x\", [\"str/upper\", \"@x\"]]]] // => [\"A\",\"B\",\"C\",\"D\"]",
      "returnType": "any"
    },
    "core/if-fn": {
      "description": "Conditional inside lambda: classify elements",
      "example": "[\"array/map\", [1, 2, 3, 4, 5], [\"fn\", \"x\", [\"if\", [\">\", \"@x\", 3], \"high\", \"low\"]]] // => [\"low\",\"low\",\"low\",\"high\",\"high\"]",
      "returnType": "array"
    },
    "core/matches": {
      "description": "Regex pattern matching on strings",
      "example": "[\"matches\", \"hello-world-42\", \"^[a-z]+-[a-z]+-[0-9]+$\"] // => true",
      "returnType": "boolean"
    },
    "core/math-composed": {
      "description": "Composed math: sqrt(x*x + y*y) distance formula",
      "example": "[\"math/round\", [\"math/sqrt\", [\"+\", [\"*\", 3, 3], [\"*\", 4, 4]]], 0] // => 5",
      "returnType": "number"
    },
    "core/obj-reduce": {
      "description": "Build objects from arrays via reduce",
      "example": "[\"array/reduce\", [\"str/split\", \"x,y,z\", \",\"], {}, [\"fn\", [\"acc\", \"k\"], [\"object/set\", \"@acc\", \"@k\", [\"str/upper\", \"@k\"]]]] // => {\"x\":\"X\",\"y\":\"Y\",\"z\":\"Z\"}",
      "returnType": "object"
    }
  },
  "math": {
    "math/abs": {
      "description": "Absolute value of a number",
      "example": "[\"math/abs\", -5] // => 5",
      "returnType": "number"
    },
    "math/min": {
      "description": "Smallest of the given numbers",
      "example": "[\"math/min\", 3, 1, 4] // => 1",
      "returnType": "number"
    },
    "math/max": {
      "description": "Largest of the given numbers",
      "example": "[\"math/max\", 3, 1, 4] // => 4",
      "returnType": "number"
    },
    "math/clamp": {
      "description": "Clamp a value between min and max",
      "example": "[\"math/clamp\", 150, 0, 100] // => 100",
      "returnType": "number"
    },
    "math/floor": {
      "description": "Round down to nearest integer",
      "example": "[\"math/floor\", 3.7] // => 3",
      "returnType": "number"
    },
    "math/ceil": {
      "description": "Round up to nearest integer",
      "example": "[\"math/ceil\", 3.2] // => 4",
      "returnType": "number"
    },
    "math/round": {
      "description": "Round to given decimal places",
      "example": "[\"math/round\", 3.456, 2] // => 3.46",
      "returnType": "number"
    },
    "math/pow": {
      "description": "Raise base to exponent",
      "example": "[\"math/pow\", 2, 8] // => 256",
      "returnType": "number"
    },
    "math/sqrt": {
      "description": "Square root",
      "example": "[\"math/sqrt\", 16] // => 4",
      "returnType": "number"
    },
    "math/mod": {
      "description": "Modulo (remainder)",
      "example": "[\"math/mod\", 7, 3] // => 1",
      "returnType": "number"
    },
    "math/sign": {
      "description": "Sign of a number (-1, 0, or 1)",
      "example": "[\"math/sign\", -42] // => -1",
      "returnType": "number"
    },
    "math/lerp": {
      "description": "Linear interpolation between two values",
      "example": "[\"math/lerp\", 0, 100, 0.5] // => 50",
      "returnType": "number"
    },
    "math/map": {
      "description": "Map a value from one range to another",
      "example": "[\"math/map\", 5, 0, 10, 0, 100] // => 50",
      "returnType": "number"
    },
    "math/random": {
      "description": "Random float between 0 and 1",
      "example": "[\"math/random\"]",
      "returnType": "number"
    },
    "math/default": {
      "description": "Return value or default if null/undefined",
      "example": "[\"math/default\", null, 0] // => 0",
      "returnType": "number"
    }
  },
  "str": {
    "str/len": {
      "description": "Length of a string",
      "example": "[\"str/len\", \"hello\"] // => 5",
      "returnType": "number"
    },
    "str/concat": {
      "description": "Concatenate strings",
      "example": "[\"str/concat\", \"hello\", \" \", \"world\"] // => \"hello world\"",
      "returnType": "string"
    },
    "str/upper": {
      "description": "Convert to uppercase",
      "example": "[\"str/upper\", \"hello\"] // => \"HELLO\"",
      "returnType": "string"
    },
    "str/lower": {
      "description": "Convert to lowercase",
      "example": "[\"str/lower\", \"HELLO\"] // => \"hello\"",
      "returnType": "string"
    },
    "str/trim": {
      "description": "Remove whitespace from both ends",
      "example": "[\"str/trim\", \"  hello  \"] // => \"hello\"",
      "returnType": "string"
    },
    "str/split": {
      "description": "Split string by delimiter",
      "example": "[\"str/split\", \"a,b,c\", \",\"] // => [\"a\", \"b\", \"c\"]",
      "returnType": "array"
    },
    "str/join": {
      "description": "Join array with delimiter",
      "example": "[\"str/join\", [\"str/split\", \"a,b,c\", \",\"], \", \"] // => \"a, b, c\"",
      "returnType": "string"
    },
    "str/slice": {
      "description": "Extract substring by index range",
      "example": "[\"str/slice\", \"hello\", 1, 4] // => \"ell\"",
      "returnType": "string"
    },
    "str/replace": {
      "description": "Replace first occurrence",
      "example": "[\"str/replace\", \"a-b-c\", \"-\", \"_\"] // => \"a_b-c\"",
      "returnType": "string"
    },
    "str/includes": {
      "description": "Check if string contains substring",
      "example": "[\"str/includes\", \"hello world\", \"world\"] // => true",
      "returnType": "boolean"
    },
    "str/repeat": {
      "description": "Repeat string N times",
      "example": "[\"str/repeat\", \"ab\", 3] // => \"ababab\"",
      "returnType": "string"
    },
    "str/reverse": {
      "description": "Reverse a string",
      "example": "[\"str/reverse\", \"hello\"] // => \"olleh\"",
      "returnType": "string"
    },
    "str/capitalize": {
      "description": "Capitalize first letter",
      "example": "[\"str/capitalize\", \"hello world\"] // => \"Hello world\"",
      "returnType": "string"
    },
    "str/default": {
      "description": "Return string or default if null/empty",
      "example": "[\"str/default\", null, \"N/A\"] // => \"N/A\"",
      "returnType": "string"
    },
    "str/template": {
      "description": "Substitute variables in template string",
      "example": "[\"str/template\", \"Hello, {name}!\", {\"name\": \"World\"}] // => \"Hello, World!\"",
      "returnType": "string"
    },
    "str/truncate": {
      "description": "Truncate string with suffix",
      "example": "[\"str/truncate\", \"Hello World\", 8, \"...\"] // => \"Hello...\"",
      "returnType": "string"
    }
  },
  "array": {
    "array/len": {
      "description": "Length of an array",
      "example": "[\"array/len\", [1, 2, 3]] // => 3",
      "returnType": "number"
    },
    "array/first": {
      "description": "First element",
      "example": "[\"array/first\", [1, 2, 3]] // => 1",
      "returnType": "any"
    },
    "array/last": {
      "description": "Last element",
      "example": "[\"array/last\", [1, 2, 3]] // => 3",
      "returnType": "any"
    },
    "array/nth": {
      "description": "Element at index (0-based)",
      "example": "[\"array/nth\", [1, 2, 3], 1] // => 2",
      "returnType": "any"
    },
    "array/slice": {
      "description": "Extract sub-array by index range",
      "example": "[\"array/slice\", [1, 2, 3, 4], 1, 3] // => [2, 3]",
      "returnType": "array"
    },
    "array/concat": {
      "description": "Concatenate arrays",
      "example": "[\"array/concat\", [1, 2], [3, 4]] // => [1, 2, 3, 4]",
      "returnType": "array"
    },
    "array/append": {
      "description": "Add item to end",
      "example": "[\"array/append\", [1, 2], 3] // => [1, 2, 3]",
      "returnType": "array"
    },
    "array/prepend": {
      "description": "Add item to beginning",
      "example": "[\"array/prepend\", [2, 3], 1] // => [1, 2, 3]",
      "returnType": "array"
    },
    "array/insert": {
      "description": "Insert item at index",
      "example": "[\"array/insert\", [1, 3], 1, 2] // => [1, 2, 3]",
      "returnType": "array"
    },
    "array/remove": {
      "description": "Remove element at index",
      "example": "[\"array/remove\", [1, 2, 3], 1] // => [1, 3]",
      "returnType": "array"
    },
    "array/reverse": {
      "description": "Reverse array order",
      "example": "[\"array/reverse\", [1, 2, 3]] // => [3, 2, 1]",
      "returnType": "array"
    },
    "array/sort": {
      "description": "Sort array elements",
      "example": "[\"array/sort\", [3, 1, 4, 1, 5]]",
      "returnType": "array"
    },
    "array/shuffle": {
      "description": "Randomly shuffle array",
      "example": "[\"array/shuffle\", [1, 2, 3, 4, 5]]",
      "returnType": "array"
    },
    "array/unique": {
      "description": "Remove duplicates",
      "example": "[\"array/unique\", [1, 2, 2, 3, 1]] // => [1, 2, 3]",
      "returnType": "array"
    },
    "array/flatten": {
      "description": "Flatten nested arrays",
      "example": "[\"array/flatten\", [[1, 2], [3, 4]]] // => [1, 2, 3, 4]",
      "returnType": "array"
    },
    "array/zip": {
      "description": "Pair elements from two arrays",
      "example": "[\"array/zip\", [1, 2, 3], [4, 5, 6]] // => [[1, 4], [2, 5], [3, 6]]",
      "returnType": "array"
    },
    "array/includes": {
      "description": "Check if array contains item",
      "example": "[\"array/includes\", [1, 2, 3], 2] // => true",
      "returnType": "boolean"
    },
    "array/find": {
      "description": "Find first element matching predicate",
      "example": "[\"array/find\", [1, 2, 3, 4], [\"fn\", \"x\", [\">\", \"@x\", 2]]] // => 3",
      "returnType": "any"
    },
    "array/filter": {
      "description": "Keep elements matching predicate",
      "example": "[\"array/filter\", [1, 2, 3, 4, 5], [\"fn\", \"x\", [\">\", \"@x\", 2]]] // => [3, 4, 5]",
      "returnType": "array"
    },
    "array/reject": {
      "description": "Remove elements matching predicate",
      "example": "[\"array/reject\", [1, 2, 3, 4, 5], [\"fn\", \"x\", [\">\", \"@x\", 3]]] // => [1, 2, 3]",
      "returnType": "array"
    },
    "array/map": {
      "description": "Transform each element",
      "example": "[\"array/map\", [1, 2, 3], [\"fn\", \"x\", [\"*\", \"@x\", 2]]] // => [2, 4, 6]",
      "returnType": "array"
    },
    "array/reduce": {
      "description": "Reduce array to single value",
      "example": "[\"array/reduce\", [1, 2, 3, 4], [\"fn\", [\"acc\", \"x\"], [\"+\", \"@acc\", \"@x\"]], 0] // => 10",
      "returnType": "any"
    },
    "array/every": {
      "description": "Check all elements match predicate",
      "example": "[\"array/every\", [2, 4, 6], [\"fn\", \"x\", [\">\", \"@x\", 0]]] // => true",
      "returnType": "boolean"
    },
    "array/some": {
      "description": "Check any element matches predicate",
      "example": "[\"array/some\", [1, 2, 3], [\"fn\", \"x\", [\">\", \"@x\", 2]]] // => true",
      "returnType": "boolean"
    },
    "array/count": {
      "description": "Count elements matching predicate",
      "example": "[\"array/count\", [1, 2, 3, 4, 5], [\"fn\", \"x\", [\">\", \"@x\", 3]]] // => 2",
      "returnType": "number"
    },
    "array/sum": {
      "description": "Sum numeric elements",
      "example": "[\"array/sum\", [10, 20, 30]] // => 60",
      "returnType": "number"
    },
    "array/avg": {
      "description": "Average of numeric elements",
      "example": "[\"array/avg\", [10, 20, 30]] // => 20",
      "returnType": "number"
    },
    "array/min": {
      "description": "Smallest element",
      "example": "[\"array/min\", [3, 1, 4, 1, 5]] // => 1",
      "returnType": "number"
    },
    "array/max": {
      "description": "Largest element",
      "example": "[\"array/max\", [3, 1, 4, 1, 5]] // => 5",
      "returnType": "number"
    },
    "array/partition": {
      "description": "Split into [matching, non-matching]",
      "example": "[\"array/partition\", [1, 2, 3, 4, 5], [\"fn\", \"x\", [\">\", \"@x\", 3]]]",
      "returnType": "array"
    },
    "array/take": {
      "description": "Take first N elements",
      "example": "[\"array/take\", [1, 2, 3, 4, 5], 3] // => [1, 2, 3]",
      "returnType": "array"
    },
    "array/drop": {
      "description": "Skip first N elements",
      "example": "[\"array/drop\", [1, 2, 3, 4, 5], 2] // => [3, 4, 5]",
      "returnType": "array"
    }
  },
  "object": {
    "object/keys": {
      "description": "Get all keys",
      "example": "[\"object/keys\", {\"a\": 1, \"b\": 2}] // => [\"a\", \"b\"]",
      "returnType": "array"
    },
    "object/values": {
      "description": "Get all values",
      "example": "[\"object/values\", {\"a\": 1, \"b\": 2}] // => [1, 2]",
      "returnType": "array"
    },
    "object/entries": {
      "description": "Get [key, value] pairs",
      "example": "[\"object/entries\", {\"a\": 1, \"b\": 2}] // => [[\"a\", 1], [\"b\", 2]]",
      "returnType": "array"
    },
    "object/get": {
      "description": "Get value at path with optional default",
      "example": "[\"object/get\", {\"name\": \"John\", \"age\": 30}, \"name\", \"Unknown\"] // => \"John\"",
      "returnType": "any"
    },
    "object/set": {
      "description": "Set value at path (immutable)",
      "example": "[\"object/set\", {\"name\": \"John\"}, \"age\", 30]",
      "returnType": "any"
    },
    "object/has": {
      "description": "Check if path exists",
      "example": "[\"object/has\", {\"name\": \"John\", \"age\": 30}, \"name\"] // => true",
      "returnType": "boolean"
    },
    "object/merge": {
      "description": "Shallow merge objects",
      "example": "[\"object/merge\", {\"a\": 1}, {\"b\": 2}] // => {\"a\": 1, \"b\": 2}",
      "returnType": "any"
    },
    "object/pick": {
      "description": "Keep only specified keys",
      "example": "[\"object/pick\", {\"name\": \"John\", \"age\": 30, \"email\": \"j@e.com\"}, [\"str/split\", \"name,email\", \",\"]]",
      "returnType": "any"
    },
    "object/omit": {
      "description": "Remove specified keys",
      "example": "[\"object/omit\", {\"name\": \"John\", \"age\": 30, \"email\": \"j@e.com\"}, [\"str/split\", \"email\", \",\"]]",
      "returnType": "any"
    },
    "object/filter": {
      "description": "Keep entries matching predicate",
      "example": "[\"object/filter\", {\"a\": 1, \"b\": 0, \"c\": 3}, [\"fn\", \"v\", [\">\", \"@v\", 0]]]",
      "returnType": "any"
    },
    "object/equals": {
      "description": "Deep equality check",
      "example": "[\"object/equals\", {\"a\": 1}, {\"a\": 1}] // => true",
      "returnType": "boolean"
    },
    "object/clone": {
      "description": "Deep clone an object",
      "example": "[\"object/clone\", {\"a\": 1, \"b\": {\"c\": 2}}]",
      "returnType": "any"
    }
  },
  "format": {
    "format/number": {
      "description": "Format number with locale separators",
      "example": "[\"format/number\", 1234567.89] // => \"1,234,567.89\"",
      "returnType": "string"
    },
    "format/currency": {
      "description": "Format as currency",
      "example": "[\"format/currency\", 1234.56, \"USD\"] // => \"$1,234.56\"",
      "returnType": "string"
    },
    "format/percent": {
      "description": "Format as percentage",
      "example": "[\"format/percent\", 0.856, 1] // => \"85.6%\"",
      "returnType": "string"
    },
    "format/bytes": {
      "description": "Format byte count as human-readable",
      "example": "[\"format/bytes\", 2500000] // => \"2.4 MB\"",
      "returnType": "string"
    },
    "format/ordinal": {
      "description": "Format as ordinal (1st, 2nd, ...)",
      "example": "[\"format/ordinal\", 42] // => \"42nd\"",
      "returnType": "string"
    },
    "format/plural": {
      "description": "Pluralize with count",
      "example": "[\"format/plural\", 5, \"item\", \"items\"] // => \"5 items\"",
      "returnType": "string"
    },
    "format/list": {
      "description": "Format array as English list",
      "example": "[\"format/list\", [\"str/split\", \"Alice,Bob,Charlie\", \",\"], \"and\"] // => \"Alice, Bob, and Charlie\"",
      "returnType": "string"
    },
    "format/phone": {
      "description": "Format phone number",
      "example": "[\"format/phone\", \"12125551234\"]",
      "returnType": "string"
    }
  },
  "time": {
    "time/now": {
      "description": "Current timestamp in milliseconds",
      "example": "[\"time/now\"]",
      "returnType": "number"
    },
    "time/today": {
      "description": "Today at midnight (local time)",
      "example": "[\"time/today\"]",
      "returnType": "number"
    },
    "time/parse": {
      "description": "Parse date string to timestamp",
      "example": "[\"time/parse\", \"2024-01-18\", \"YYYY-MM-DD\"]",
      "returnType": "number"
    },
    "time/format": {
      "description": "Format timestamp as string",
      "example": "[\"time/format\", 1705593600000, \"YYYY-MM-DD\"]",
      "returnType": "string"
    },
    "time/year": {
      "description": "Extract year from timestamp",
      "example": "[\"time/year\", 1705593600000]",
      "returnType": "number"
    },
    "time/month": {
      "description": "Extract month (1-12) from timestamp",
      "example": "[\"time/month\", 1705593600000]",
      "returnType": "number"
    },
    "time/day": {
      "description": "Extract day of month from timestamp",
      "example": "[\"time/day\", 1705593600000]",
      "returnType": "number"
    },
    "time/weekday": {
      "description": "Extract day of week (0=Sun, 6=Sat)",
      "example": "[\"time/weekday\", 1705593600000]",
      "returnType": "number"
    },
    "time/hour": {
      "description": "Extract hour (0-23) from timestamp",
      "example": "[\"time/hour\", 1705593600000]",
      "returnType": "number"
    },
    "time/minute": {
      "description": "Extract minute (0-59) from timestamp",
      "example": "[\"time/minute\", 1705593600000]",
      "returnType": "number"
    },
    "time/second": {
      "description": "Extract second (0-59) from timestamp",
      "example": "[\"time/second\", 1705593600000]",
      "returnType": "number"
    },
    "time/add": {
      "description": "Add time units to timestamp",
      "example": "[\"time/add\", [\"time/now\"], 7, \"day\"]",
      "returnType": "number"
    },
    "time/subtract": {
      "description": "Subtract time units from timestamp",
      "example": "[\"time/subtract\", [\"time/now\"], 1, \"hour\"]",
      "returnType": "number"
    },
    "time/diff": {
      "description": "Difference between two timestamps (ms)",
      "example": "[\"time/diff\", [\"time/now\"], [\"time/subtract\", [\"time/now\"], 2, \"hour\"]]",
      "returnType": "number"
    },
    "time/relative": {
      "description": "Human-readable relative time",
      "example": "[\"time/relative\", [\"time/subtract\", [\"time/now\"], 2, \"hour\"]]",
      "returnType": "string"
    },
    "time/duration": {
      "description": "Format milliseconds as duration",
      "example": "[\"time/duration\", 9000000] // => \"2h 30m\"",
      "returnType": "string"
    }
  },
  "validate": {
    "validate/required": {
      "description": "Check value is not null/undefined/empty",
      "example": "[\"validate/required\", \"hello\"] // => true",
      "returnType": "boolean"
    },
    "validate/string": {
      "description": "Check value is a string",
      "example": "[\"validate/string\", \"hello\"] // => true",
      "returnType": "boolean"
    },
    "validate/number": {
      "description": "Check value is a number",
      "example": "[\"validate/number\", 42] // => true",
      "returnType": "boolean"
    },
    "validate/boolean": {
      "description": "Check value is a boolean",
      "example": "[\"validate/boolean\", true] // => true",
      "returnType": "boolean"
    },
    "validate/array": {
      "description": "Check value is an array",
      "example": "[\"validate/array\", [1, 2, 3]] // => true",
      "returnType": "boolean"
    },
    "validate/object": {
      "description": "Check value is an object",
      "example": "[\"validate/object\", {\"a\": 1}] // => true",
      "returnType": "boolean"
    },
    "validate/email": {
      "description": "Check valid email format",
      "example": "[\"validate/email\", \"user@example.com\"] // => true",
      "returnType": "boolean"
    },
    "validate/url": {
      "description": "Check valid URL format",
      "example": "[\"validate/url\", \"https://example.com\"] // => true",
      "returnType": "boolean"
    },
    "validate/uuid": {
      "description": "Check valid UUID format",
      "example": "[\"validate/uuid\", \"550e8400-e29b-41d4-a716-446655440000\"] // => true",
      "returnType": "boolean"
    },
    "validate/phone": {
      "description": "Check valid phone number",
      "example": "[\"validate/phone\", \"+12125551234\"] // => true",
      "returnType": "boolean"
    },
    "validate/date": {
      "description": "Check valid date string",
      "example": "[\"validate/date\", \"2024-01-18\"] // => true",
      "returnType": "boolean"
    },
    "validate/length": {
      "description": "Check exact string length",
      "example": "[\"validate/length\", \"abc123\", 6] // => true",
      "returnType": "boolean"
    },
    "validate/min": {
      "description": "Check value >= minimum",
      "example": "[\"validate/min\", 21, 18] // => true",
      "returnType": "boolean"
    },
    "validate/max": {
      "description": "Check value <= maximum",
      "example": "[\"validate/max\", 50, 100] // => true",
      "returnType": "boolean"
    },
    "validate/range": {
      "description": "Check value is within range",
      "example": "[\"validate/range\", 3, 1, 5] // => true",
      "returnType": "boolean"
    },
    "validate/pattern": {
      "description": "Check string matches regex pattern",
      "example": "[\"validate/pattern\", \"abc123\", \"^[a-z0-9]+$\"] // => true",
      "returnType": "boolean"
    },
    "validate/equals": {
      "description": "Check two values are equal",
      "example": "[\"validate/equals\", \"hello\", \"hello\"] // => true",
      "returnType": "boolean"
    },
    "validate/check": {
      "description": "Run multiple validation rules",
      "example": "",
      "returnType": "any"
    }
  },
  "prob": {
    "prob/seed": {
      "description": "Set random seed for reproducibility",
      "example": "[\"prob/seed\", 42]",
      "returnType": "void"
    },
    "prob/flip": {
      "description": "Random boolean with given probability",
      "example": "[\"prob/flip\", 0.5]",
      "returnType": "boolean"
    },
    "prob/gaussian": {
      "description": "Sample from normal distribution",
      "example": "[\"prob/gaussian\", 0, 1]",
      "returnType": "number"
    },
    "prob/uniform": {
      "description": "Random number in [min, max)",
      "example": "[\"prob/uniform\", 0, 10]",
      "returnType": "number"
    },
    "prob/beta": {
      "description": "Sample from beta distribution",
      "example": "[\"prob/beta\", 2, 5]",
      "returnType": "number"
    },
    "prob/categorical": {
      "description": "Weighted random selection",
      "example": "[\"prob/categorical\", [10, 20, 30], [1, 2, 1]]",
      "returnType": "any"
    },
    "prob/poisson": {
      "description": "Sample from Poisson distribution",
      "example": "[\"prob/poisson\", 4]",
      "returnType": "number"
    },
    "prob/condition": {
      "description": "Assert a condition holds",
      "example": "[\"prob/condition\", [\">\", 5, 0]]",
      "returnType": "void"
    },
    "prob/sample": {
      "description": "Draw N samples from expression",
      "example": "[\"prob/sample\", 1000, [\"prob/flip\", 0.5]]",
      "returnType": "array"
    },
    "prob/posterior": {
      "description": "Rejection sampling for posterior inference",
      "example": "[\"prob/posterior\", [\"prob/gaussian\", 0, 1], true, null, 100]",
      "returnType": "array"
    },
    "prob/infer": {
      "description": "Compute mean of numeric samples",
      "example": "[\"prob/infer\", [2, 4, 6, 8]] // => 5",
      "returnType": "number"
    },
    "prob/variance": {
      "description": "Compute variance of samples",
      "example": "[\"prob/variance\", [2, 4, 4, 4, 5, 5, 7, 9]] // => 4",
      "returnType": "number"
    },
    "prob/histogram": {
      "description": "Bin samples into histogram",
      "example": "[\"prob/histogram\", [1, 2, 3, 4, 5], 2]",
      "returnType": "object"
    },
    "prob/percentile": {
      "description": "Compute percentile of samples",
      "example": "[\"prob/percentile\", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0.5] // => 5",
      "returnType": "number"
    }
  },
  "async": {
    "async/delay": {
      "description": "Execute effect after delay (ms)",
      "example": "[\"async/delay\", 2000, [\"emit\", \"RETRY\"]]",
      "returnType": "any"
    },
    "async/interval": {
      "description": "Execute effect on interval (ms)",
      "example": "[\"async/interval\", 5000, [\"emit\", \"POLL_TICK\"]]",
      "returnType": "string"
    },
    "async/timeout": {
      "description": "Execute with timeout limit (ms)",
      "example": "[\"async/timeout\", [\"emit\", \"FETCH\"], 5000]",
      "returnType": "any"
    },
    "async/debounce": {
      "description": "Debounce event emission (ms)",
      "example": "[\"async/debounce\", \"SEARCH\", 300]",
      "returnType": "void"
    },
    "async/throttle": {
      "description": "Throttle event emission (ms)",
      "example": "[\"async/throttle\", \"SCROLL\", 100]",
      "returnType": "void"
    },
    "async/retry": {
      "description": "Retry effect with backoff",
      "example": "[\"async/retry\", [\"emit\", \"FETCH\"], {\"attempts\": 3}]",
      "returnType": "any"
    },
    "async/race": {
      "description": "Return first effect to complete",
      "example": "[\"async/race\", [\"emit\", \"FAST\"], [\"emit\", \"SLOW\"]]",
      "returnType": "any"
    },
    "async/all": {
      "description": "Execute all effects in parallel",
      "example": "[\"async/all\", [\"emit\", \"A\"], [\"emit\", \"B\"]]",
      "returnType": "array"
    },
    "async/sequence": {
      "description": "Execute effects in order",
      "example": "[\"async/sequence\", [\"emit\", \"FIRST\"], [\"emit\", \"SECOND\"]]",
      "returnType": "array"
    }
  },
  "nn": {
    "nn/sequential": {
      "description": "Stack layers sequentially",
      "example": "[\"nn/sequential\", [\"nn/linear\", 16, 64], [\"nn/relu\"], [\"nn/linear\", 64, 4]]",
      "returnType": "nn/module"
    },
    "nn/linear": {
      "description": "Fully connected layer",
      "example": "[\"nn/linear\", 16, 64]",
      "returnType": "nn/layer"
    },
    "nn/relu": {
      "description": "ReLU activation: max(0, x)",
      "example": "[\"nn/relu\"]",
      "returnType": "nn/layer"
    },
    "nn/tanh": {
      "description": "Tanh activation function",
      "example": "[\"nn/tanh\"]",
      "returnType": "nn/layer"
    },
    "nn/sigmoid": {
      "description": "Sigmoid activation: 1/(1+e^-x)",
      "example": "[\"nn/sigmoid\"]",
      "returnType": "nn/layer"
    },
    "nn/softmax": {
      "description": "Softmax normalization",
      "example": "[\"nn/softmax\"]",
      "returnType": "nn/layer"
    },
    "nn/dropout": {
      "description": "Dropout regularization",
      "example": "[\"nn/dropout\", 0.3]",
      "returnType": "nn/layer"
    },
    "nn/batchnorm": {
      "description": "Batch normalization",
      "example": "[\"nn/batchnorm\", 64]",
      "returnType": "nn/layer"
    },
    "nn/layernorm": {
      "description": "Layer normalization",
      "example": "[\"nn/layernorm\", 64]",
      "returnType": "nn/layer"
    },
    "nn/forward": {
      "description": "Forward pass through network",
      "example": "[\"nn/forward\", [\"nn/sequential\", [\"nn/linear\", 4, 8], [\"nn/relu\"]], [1, 2, 3, 4]]",
      "returnType": "any"
    },
    "nn/clone": {
      "description": "Clone a neural network module",
      "example": "[\"nn/clone\", [\"nn/sequential\", [\"nn/linear\", 4, 8]]]",
      "returnType": "nn/module"
    }
  },
  "tensor": {
    "tensor/from": {
      "description": "Create tensor from array",
      "example": "[\"tensor/from\", [1.0, 2.0, 3.0]]",
      "returnType": "tensor"
    },
    "tensor/zeros": {
      "description": "Tensor of zeros with given shape",
      "example": "[\"tensor/zeros\", [3, 4]]",
      "returnType": "tensor"
    },
    "tensor/ones": {
      "description": "Tensor of ones with given shape",
      "example": "[\"tensor/ones\", [3, 4]]",
      "returnType": "tensor"
    },
    "tensor/rand": {
      "description": "Random uniform tensor",
      "example": "[\"tensor/rand\", [16]]",
      "returnType": "tensor"
    },
    "tensor/randn": {
      "description": "Random normal tensor",
      "example": "[\"tensor/randn\", [16]]",
      "returnType": "tensor"
    },
    "tensor/shape": {
      "description": "Get tensor dimensions",
      "example": "[\"tensor/shape\", [\"tensor/from\", [1, 2, 3]]]",
      "returnType": "number[]"
    },
    "tensor/get": {
      "description": "Get element at index",
      "example": "[\"tensor/get\", [\"tensor/from\", [10, 20, 30]], 1] // => 20",
      "returnType": "number"
    },
    "tensor/slice": {
      "description": "Slice tensor by index range",
      "example": "[\"tensor/slice\", [\"tensor/from\", [1, 2, 3, 4, 5]], 0, 3]",
      "returnType": "tensor"
    },
    "tensor/reshape": {
      "description": "Reshape tensor to new dimensions",
      "example": "[\"tensor/reshape\", [\"tensor/from\", [1, 2, 3, 4]], [2, 2]]",
      "returnType": "tensor"
    },
    "tensor/flatten": {
      "description": "Flatten to 1D tensor",
      "example": "[\"tensor/flatten\", [\"tensor/from\", [1, 2, 3]]]",
      "returnType": "tensor"
    },
    "tensor/add": {
      "description": "Element-wise addition",
      "example": "[\"tensor/add\", [\"tensor/from\", [1, 2, 3]], [\"tensor/from\", [4, 5, 6]]]",
      "returnType": "tensor"
    },
    "tensor/sub": {
      "description": "Element-wise subtraction",
      "example": "[\"tensor/sub\", [\"tensor/from\", [4, 5, 6]], [\"tensor/from\", [1, 2, 3]]]",
      "returnType": "tensor"
    },
    "tensor/mul": {
      "description": "Element-wise multiplication or scalar multiply",
      "example": "[\"tensor/mul\", [\"tensor/from\", [1, 2, 3]], 2]",
      "returnType": "tensor"
    },
    "tensor/div": {
      "description": "Element-wise division or scalar divide",
      "example": "[\"tensor/div\", [\"tensor/from\", [10, 20, 30]], 10]",
      "returnType": "tensor"
    },
    "tensor/matmul": {
      "description": "Matrix multiplication",
      "example": "[\"tensor/matmul\", [\"tensor/from\", [[1, 2], [3, 4]]], [\"tensor/from\", [[5, 6], [7, 8]]]]",
      "returnType": "tensor"
    },
    "tensor/dot": {
      "description": "Dot product of two vectors",
      "example": "[\"tensor/dot\", [\"tensor/from\", [1, 2, 3]], [\"tensor/from\", [4, 5, 6]]]",
      "returnType": "number"
    },
    "tensor/sum": {
      "description": "Sum all elements",
      "example": "[\"tensor/sum\", [\"tensor/from\", [1, 2, 3, 4]]]",
      "returnType": "number | tensor"
    },
    "tensor/mean": {
      "description": "Mean of all elements",
      "example": "[\"tensor/mean\", [\"tensor/from\", [2, 4, 6, 8]]]",
      "returnType": "number | tensor"
    },
    "tensor/max": {
      "description": "Maximum element",
      "example": "[\"tensor/max\", [\"tensor/from\", [3, 1, 4, 1, 5]]]",
      "returnType": "number | tensor"
    },
    "tensor/min": {
      "description": "Minimum element",
      "example": "[\"tensor/min\", [\"tensor/from\", [3, 1, 4, 1, 5]]]",
      "returnType": "number | tensor"
    },
    "tensor/argmax": {
      "description": "Index of maximum element",
      "example": "[\"tensor/argmax\", [\"tensor/from\", [3, 1, 4, 1, 5]]]",
      "returnType": "number | tensor"
    },
    "tensor/norm": {
      "description": "L2 norm of tensor",
      "example": "[\"tensor/norm\", [\"tensor/from\", [3, 4]]]",
      "returnType": "number"
    },
    "tensor/clamp": {
      "description": "Clamp values to range",
      "example": "[\"tensor/clamp\", [\"tensor/from\", [-1, 0, 5, 10]], 0, 5]",
      "returnType": "tensor"
    }
  },
  "train": {
    "train/loop": {
      "description": "Run training loop with config",
      "example": "[\"train/loop\", [\"nn/sequential\", [\"nn/linear\", 4, 8]], [], {}]",
      "returnType": "train/result"
    },
    "train/step": {
      "description": "Single training step",
      "example": "[\"train/step\", [\"nn/sequential\", [\"nn/linear\", 4, 8]], [1, 2, 3, 4], [0, 1], {}]",
      "returnType": "train/stepResult"
    },
    "train/validate": {
      "description": "Validate model on test data",
      "example": "[\"train/validate\", [\"nn/sequential\", [\"nn/linear\", 4, 2]], []]",
      "returnType": "any"
    },
    "train/mse": {
      "description": "Mean squared error loss",
      "example": "[\"train/mse\", [\"tensor/from\", [1, 2, 3]], [\"tensor/from\", [1.5, 2.5, 2.5]]]",
      "returnType": "number"
    },
    "train/huber": {
      "description": "Huber loss (smooth L1)",
      "example": "[\"train/huber\", [\"tensor/from\", [1, 2, 3]], [\"tensor/from\", [1.5, 2.5, 2.5]], 1.0]",
      "returnType": "number"
    },
    "train/sgd": {
      "description": "SGD optimizer step",
      "example": "[\"train/sgd\", [\"nn/sequential\", [\"nn/linear\", 4, 2]], 0.01, 0.9]",
      "returnType": "void"
    },
    "train/adam": {
      "description": "Adam optimizer step",
      "example": "[\"train/adam\", [\"nn/sequential\", [\"nn/linear\", 4, 2]], 0.001]",
      "returnType": "void"
    }
  }
};
