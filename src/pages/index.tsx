import React from "react";
import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Translate, { translate } from "@docusaurus/Translate";
import CodeBlock from "@theme/CodeBlock";
import {
  VStack,
  HStack,
  Typography,
  Button,
  Badge,
  Icon,
  Card,
  Box,
  SimpleGrid,
  Divider,
} from "@almadar/ui/marketing";
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
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
    icon: "monitor-smartphone" as const,
    title: translate({ id: "orb.why.compile.title", message: "Write Once, Compile Anywhere" }),
    description: translate({ id: "orb.why.compile.desc", message: "One .orb model compiles to web, mobile, desktop, or any future platform. The behavior is platform-independent." }),
  },
  {
    icon: "shield-check" as const,
    title: translate({ id: "orb.why.correct.title", message: "Compiler-Verified" }),
    description: translate({ id: "orb.why.correct.desc", message: "The compiler checks every possible screen your app can reach. If it compiles, users never hit a broken or missing page." }),
  },
  {
    icon: "bot" as const,
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
      {/* Hero */}
      <Box as="header" className="w-full min-h-[60vh] flex items-center relative overflow-hidden">
        <OrbitalHeroBackground />
        <Box className="site-container py-20 relative z-10">
          <VStack gap="lg" align="start">
            <Badge variant="primary">{translate({ id: "orb.hero.tag", message: "Open Source" })}</Badge>
            <Typography variant="h1">{translate({ id: "orb.hero.title", message: "Orb" })}</Typography>
            <Typography variant="body1" color="muted">{translate({ id: "orb.hero.subtitle", message: "A formal language for describing how software systems behave. Write the model. The compiler proves it correct. AI generates and consumes it natively." })}</Typography>
            <Box className="font-mono text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-2 select-all">
              curl -fsSL https://orb.almadar.io/install.sh | sh
            </Box>
            <HStack gap="md">
              <Link to="/docs/getting-started/introduction">
                <Button variant="primary" size="lg">{translate({ id: "orb.hero.cta1", message: "Get Started" })}</Button>
              </Link>
              <Link to="/stdlib">
                <Button variant="secondary" size="lg">{translate({ id: "orb.hero.cta2", message: "Standard Library" })}</Button>
              </Link>
            </HStack>
          </VStack>
        </Box>
      </Box>

      {/* Split: One File, Full Application */}
      <Box className="w-full">
        <Box className="site-container py-24">
          <HStack gap="xl" className="flex-col lg:flex-row items-start">
            <Box className="flex-1">
              <VStack gap="md">
                <Typography variant="h2">{translate({ id: "orb.example.title", message: "One File, Full Application" })}</Typography>
                <Typography variant="body1" color="muted">{translate({ id: "orb.example.subtitle", message: "A complete task manager in a single .orb file. The compiler generates frontend, backend, database, and API." })}</Typography>
              </VStack>
            </Box>
            <Box className="flex-1 lg:flex-[2]">
              <CodeBlock language="orb" title="task-manager.orb">
                {EXAMPLE_CODE}
              </CodeBlock>
            </Box>
          </HStack>
        </Box>
      </Box>

      {/* Why .orb? */}
      <Box className="w-full bg-[var(--color-surface)]">
        <Box className="site-container py-24">
          <VStack gap="lg" align="center" className="w-full">
            <Typography variant="h2">
              <Translate id="orb.why.title">Why .orb?</Translate>
            </Typography>
            <SimpleGrid cols={3} gap="lg">
              {WHY_FEATURES.map((f) => (
                <Card key={f.title} className="p-6">
                  <VStack gap="sm">
                    <Icon name={f.icon} size={28} className="text-[var(--color-primary)]" />
                    <Typography variant="h4">{f.title}</Typography>
                    <Typography variant="body2" color="muted">{f.description}</Typography>
                  </VStack>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Box>
      </Box>

      {/* Gradient divider */}
      <Box className="w-full h-px" style={{ background: "linear-gradient(to right, transparent, var(--color-primary), transparent)" }} />

      {/* Standard Library */}
      <Box className="w-full">
        <Box className="site-container py-24">
          <HStack gap="xl" className="flex-col lg:flex-row items-center">
            <Box className="flex-1">
              <VStack gap="md">
                <Typography variant="h2">{translate({ id: "orb.stdlib.title", message: "Standard Library" })}</Typography>
                <Typography variant="body1" color="muted">{translate({ id: "orb.stdlib.subtitle", message: "93 production-quality behaviors across 18 domains. 50 atoms, 18 molecules, 25 organisms. Commerce, healthcare, education, gaming, DevOps, and more." })}</Typography>
                <HStack gap="sm" className="flex-wrap mt-2">
                  {DOMAIN_TAGS.map((tag) => (
                    <Badge key={tag} variant="primary">{tag}</Badge>
                  ))}
                </HStack>
                <Box className="mt-2">
                  <Link to="/stdlib">
                    <Button variant="primary" size="lg">
                      <Translate id="orb.stdlib.cta">Browse the Standard Library</Translate>
                    </Button>
                  </Link>
                </Box>
              </VStack>
            </Box>
            <Box className="flex-1 flex justify-center" style={{ maxWidth: 300 }}>
              <ThemedImage
                alt="Orb Standard Library Module"
                sources={{
                  light: useBaseUrl('/img/illustrations/Orb-Stdlib-Index-light.svg'),
                  dark: useBaseUrl('/img/illustrations/Orb-Stdlib-Index-dark.svg'),
                }}
                className="w-full drop-shadow-xl"
              />
            </Box>
          </HStack>
        </Box>
      </Box>

      {/* Open Source Community */}
      <Box className="w-full bg-[var(--color-foreground)] text-[var(--color-background)]">
        <Box className="site-container py-24">
          <VStack gap="lg" align="center" className="w-full">
            <Typography variant="h2" className="text-[var(--color-background)]">
              <Translate id="orb.community.title">Open Source Community</Translate>
            </Typography>
            <Typography variant="body1" className="text-[var(--color-background)]/60">
              <Translate id="orb.community.subtitle">Orb and its compiler are open source. Contribute, report issues, or build something new.</Translate>
            </Typography>
            <HStack gap="md">
              <a href="https://github.com/almadar-io/orb" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="lg">
                  <HStack gap="sm" align="center">
                    <Icon name="github" size={20} />
                    <Typography variant="body2">GitHub</Typography>
                  </HStack>
                </Button>
              </a>
              <a href="https://discord.gg/q83VjPJx" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="lg">
                  <HStack gap="sm" align="center">
                    <Icon name="message-circle" size={20} />
                    <Typography variant="body2">Discord</Typography>
                  </HStack>
                </Button>
              </a>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Layout>
  );
}
