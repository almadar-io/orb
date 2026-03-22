import React from "react";
import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Translate, { translate } from "@docusaurus/Translate";
import CodeBlock from "@theme/CodeBlock";
import {
  HeroSection,
  ContentSection,
  SplitSection,
  FeatureGrid,
  TagCloud,
  CommunityLinks,
  VStack,
  Typography,
  Button,
  Box,
  GradientDivider,
} from "@almadar/ui/marketing";
import { AvlOrbitalUnit } from "@almadar/ui/illustrations";
import { OrbitalHeroBackground } from "../components/OrbitalHeroBackground";

const EXAMPLE_CODE = `{
  "name": "TaskApp",
  "orbitals": [{
    "name": "TaskOrbital",
    "entity": {
      "name": "Task",
      "persistence": "persistent",
      "collection": "tasks",
      "fields": [
        { "name": "id", "type": "string" },
        { "name": "title", "type": "string" },
        { "name": "status", "type": "string", "default": "pending" }
      ]
    },
    "traits": [{
      "name": "TaskManager",
      "linkedEntity": "Task",
      "category": "interaction",
      "stateMachine": {
        "states": [
          { "name": "viewing", "isInitial": true },
          { "name": "adding" }
        ],
        "events": [
          { "key": "INIT", "name": "Initialize" },
          { "key": "ADD", "name": "Add Task" },
          { "key": "SAVE", "name": "Save" },
          { "key": "CANCEL", "name": "Cancel" }
        ],
        "transitions": [
          { "from": "viewing", "to": "viewing", "event": "INIT",
            "effects": [["fetch", "Task"],
              ["render-ui", "main", { "type": "entity-table", "entity": "Task" }]] },
          { "from": "viewing", "to": "adding", "event": "ADD",
            "effects": [["render-ui", "modal", { "type": "form", "entity": "Task" }]] },
          { "from": "adding", "to": "viewing", "event": "SAVE",
            "effects": [["persist", "create", "Task", "@payload"]] },
          { "from": "adding", "to": "viewing", "event": "CANCEL" }
        ]
      }
    }],
    "pages": [{ "name": "Tasks", "path": "/tasks" }]
  }]
}`;

const WHY_FEATURES = [
  {
    icon: "monitor-smartphone",
    title: translate({ id: "orb.why.compile.title", message: "Write Once, Compile Anywhere" }),
    description: translate({ id: "orb.why.compile.desc", message: "One .orb model compiles to web, mobile, desktop, or any future platform. The behavior is platform-independent." }),
  },
  {
    icon: "shield-check",
    title: translate({ id: "orb.why.correct.title", message: "Compiler-Verified" }),
    description: translate({ id: "orb.why.correct.desc", message: "The compiler checks every possible screen your app can reach. If it compiles, users never hit a broken or missing page." }),
  },
  {
    icon: "bot",
    title: translate({ id: "orb.why.ai.title", message: "AI Generates It Natively" }),
    description: translate({ id: "orb.why.ai.desc", message: "Structured, formal, and compact. AI models generate valid .orb programs more reliably than arbitrary code." }),
  },
];

const DOMAIN_TAGS = [
  "Commerce", "Healthcare", "Education", "Finance", "Scheduling", "Workflow",
  "Social", "Media", "Gaming", "IoT", "CRM", "Analytics",
  "Communication", "Content", "Location", "HR", "Legal", "Real Estate",
];

export default function OrbHome(): ReactNode {
  return (
    <Layout
      title={translate({ id: "orb.meta.title", message: "Orb — A Programming Language for Formal World Models" })}
      description={translate({ id: "orb.meta.desc", message: "Orb describes how software systems behave. Write the model, the compiler proves it correct." })}
    >
      <HeroSection
        tag={translate({ id: "orb.hero.tag", message: "Open Source" })}
        title={translate({ id: "orb.hero.title", message: "Orb" })}
        subtitle={translate({ id: "orb.hero.subtitle", message: "A formal language for describing how software systems behave. Write the model. The compiler proves it correct. AI generates and consumes it natively." })}
        installCommand="curl -fsSL https://orb.almadar.io/install.sh | sh"
        primaryAction={{ label: translate({ id: "orb.hero.cta1", message: "Get Started" }), href: "/docs/getting-started/introduction" }}
        secondaryAction={{ label: translate({ id: "orb.hero.cta2", message: "Standard Library" }), href: "/stdlib" }}
        backgroundElement={<OrbitalHeroBackground />}
      />

      <ContentSection>
        <SplitSection
          title={translate({ id: "orb.example.title", message: "One File, Full Application" })}
          description={translate({ id: "orb.example.subtitle", message: "A complete task manager in a single .orb file. The compiler generates frontend, backend, database, and API." })}
          image={{ src: "/img/hero-code-to-app.webp", alt: "Code to app compilation" }}
          imagePosition="left"
        >
          <CodeBlock language="json" title="task-manager.orb">
            {EXAMPLE_CODE}
          </CodeBlock>
        </SplitSection>
      </ContentSection>

      <ContentSection background="alt">
        <VStack gap="lg" align="center" className="container">
          <Typography variant="h2">
            <Translate id="orb.why.title">Why .orb?</Translate>
          </Typography>
          <FeatureGrid items={WHY_FEATURES} columns={3} />
        </VStack>
      </ContentSection>

      <GradientDivider />

      <ContentSection>
        <SplitSection
          title={translate({ id: "orb.stdlib.title", message: "Standard Library" })}
          description={translate({ id: "orb.stdlib.subtitle", message: "93 production-quality behaviors across 18 domains. 50 atoms, 18 molecules, 25 organisms. Commerce, healthcare, education, gaming, DevOps, and more." })}
          imagePosition="right"
        >
          <Box className="w-full max-w-sm mx-auto"><AvlOrbitalUnit className="w-full" entityName="Behavior" fields={4} traits={[{ name: "Lifecycle" }, { name: "std-auth" }]} pages={[{ name: "/login" }, { name: "/profile" }]} /></Box>
        </SplitSection>
        <Box className="container mt-6">
          <TagCloud tags={DOMAIN_TAGS} variant="primary" />
        </Box>
        <Box className="container mt-6 flex justify-center">
          <Link to="/stdlib">
            <Button variant="primary" size="lg">
              <Translate id="orb.stdlib.cta">Browse the Standard Library</Translate>
            </Button>
          </Link>
        </Box>
      </ContentSection>

      <ContentSection background="dark">
        <VStack gap="lg" align="center" className="container">
          <Typography variant="h2" className="text-[var(--color-background)]">
            <Translate id="orb.community.title">Open Source Community</Translate>
          </Typography>
          <Typography variant="body" className="text-[var(--color-background)]/60">
            <Translate id="orb.community.subtitle">Orb and its compiler are open source. Contribute, report issues, or build something new.</Translate>
          </Typography>
          <CommunityLinks
            github={{ url: "https://github.com/almadar-io/orb" }}
            discord={{ url: "https://discord.gg/q83VjPJx" }}
          />
        </VStack>
      </ContentSection>
    </Layout>
  );
}
