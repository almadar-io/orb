import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docsSidebar: [
    { type: "doc", id: "index", label: "Overview" },
    { type: "category", label: "Getting Started", items: ["getting-started/introduction"] },
    {
      type: "category", label: "Core Concepts",
      items: [
        "en/core-concepts/entities",
        "en/core-concepts/traits",
        "en/core-concepts/pages",
        "en/core-concepts/closed-circuit",
        "en/core-concepts/patterns",
        "en/core-concepts/standard-library",
      ],
    },
    {
      type: "category", label: "Operator Reference",
      link: { type: "doc", id: "reference/operators/index" },
      items: [
        "reference/operators/math", "reference/operators/str", "reference/operators/array",
        "reference/operators/object", "reference/operators/time", "reference/operators/validate",
        "reference/operators/format", "reference/operators/async", "reference/operators/prob",
      ],
    },
    { type: "category", label: "Standard Behaviors", items: ["reference/behaviors", "reference/standard-library"] },
    {
      type: "category", label: "Tutorials",
      items: [
        { type: "category", label: "Beginner", items: ["tutorials/beginner/complete-orbital", "tutorials/beginner/task-manager"] },
        { type: "category", label: "Intermediate", items: ["tutorials/intermediate/ui-patterns", "tutorials/intermediate/guards", "tutorials/intermediate/cross-orbital"] },
        { type: "category", label: "Advanced", items: ["tutorials/advanced/full-app", "tutorials/advanced/ai-generation"] },
      ],
    },
    { type: "category", label: "Downloads", items: ["downloads/cli", "downloads/skills"] },
    { type: "category", label: "Community", items: ["community/contributing"] },
  ],
};
export default sidebars;
