/**
 * Playground Page (SSG-safe wrapper)
 *
 * The playground content uses @almadar/ui components which access `window`
 * during module initialization. To prevent SSG failures, the actual content
 * is in a separate file (PlaygroundContent.tsx) loaded via BrowserOnly + require().
 * This file has ZERO @almadar/ui imports and is safe for Node.js SSG.
 */
import React from "react";
import type { ReactNode } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import Layout from "@theme/Layout";
import { translate } from "@docusaurus/Translate";

export default function Playground(): ReactNode {
  return (
    <Layout
      title={translate({ id: "playground.meta.title", message: "Playground — Orb" })}
      description={translate({
        id: "playground.meta.description",
        message: "Live preview of Orb standard behaviors and modules.",
      })}
    >
      <BrowserOnly fallback={
        <div style={{ padding: "4rem", textAlign: "center", color: "#94a3b8" }}>
          Loading playground...
        </div>
      }>
        {() => {
          const PlaygroundContent = require("../components/PlaygroundContent").default;
          return <PlaygroundContent />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
