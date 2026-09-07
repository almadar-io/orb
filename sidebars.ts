import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";
import { behaviorSidebarItems } from "./sidebars-behaviors";

const sidebars: SidebarsConfig = {
  docsSidebar: [
    { type: "category", label: "Getting Started", items: ["getting-started/introduction", "getting-started/installation", "getting-started/quickstart", "getting-started/project-structure"] },
    {
      type: "category", label: "Core Concepts",
      items: [
        "core-concepts/entities",
        "core-concepts/traits",
        "core-concepts/pages",
        "core-concepts/closed-circuit",
        "core-concepts/patterns",
        "core-concepts/standard-library",
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
    { type: "category", label: "Standard Behaviors", items: behaviorSidebarItems },
    { type: "doc", id: "reference/avl", label: "AVL Visual Language" },
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
    { type: "category", label: "Enterprise", items: ["enterprise/index"] },
  ],
};
export default sidebars;
