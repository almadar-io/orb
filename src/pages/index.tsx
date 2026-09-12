import React from "react";
import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Translate, { translate } from "@docusaurus/Translate";
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
  AnimatedReveal,
  InstallBox,
} from "@almadar/ui/marketing";
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { OrbitalHeroBackground } from "../components/OrbitalHeroBackground";
import CodePreviewTabs from "../components/CodePreviewTabs";
import { HOME_EXAMPLE_CODE } from "../data/home-example";
import HOME_EXAMPLE_SCHEMA from "../data/home-example-schema.json";

const WHY_FEATURES = [
  {
    icon: "shield-check" as const,
    title: translate({ id: "orb.why.correct.title", message: "The rule is the shape of the graph" }),
    description: translate({ id: "orb.why.correct.desc", message: "No SHIP under pending means a pending order cannot ship. Not an if in four places, not a disabled button. The compiler walks the graph and refuses a modal with no exit, a state nobody can reach, or an event nobody handles." }),
  },
  {
    icon: "monitor-smartphone" as const,
    title: translate({ id: "orb.why.compile.title", message: "One program, many languages" }),
    description: translate({ id: "orb.why.compile.desc", message: "An Orb program can only say eight kinds of effect, so a new target is a mapping, not a rewrite. The same machine compiles to TypeScript, Python, or Rust, and the browser and server copies can never disagree about a rule." }),
  },
  {
    icon: "bot" as const,
    title: translate({ id: "orb.why.ai.title", message: "Built for humans and LLMs" }),
    description: translate({ id: "orb.why.ai.desc", message: "The structures are declared and the feedback is exact: the compiler names the field, the line, and the fix. A model writes, validates, and repairs. It does not have to be right the first time, and neither do you." }),
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
      title={translate({ id: "orb.meta.title", message: "Orb — A Programming Language for Humans and LLMs" })}
      description={translate({ id: "orb.meta.desc", message: "Orb is a programming language where the lifecycle is the primitive. Declare an entity, its states, and what each event does; the compiler checks the whole circuit and emits the app." })}
    >
      {/* Hero */}
      <Box as="header" className="w-full min-h-[60vh] flex items-center relative overflow-hidden">
        <OrbitalHeroBackground />
        <Box className="site-container py-20 relative z-10">
          <VStack gap="lg" align="start">
            <Typography variant="h1">{translate({ id: "orb.hero.title", message: "Orb" })}</Typography>
            <Typography variant="body1" color="muted">{translate({ id: "orb.hero.subtitle", message: "A programming language where the lifecycle is the primitive. Declare an entity, the states it can be in, and what each event does. The data, the effects, the UI, and the routes hang off that, and the compiler walks the graph before anything runs." })}</Typography>
            <InstallBox command="curl -fsSL https://orb.almadar.io/install.sh | sh" className="max-w-full overflow-hidden" />
            <HStack gap="md" className="flex-wrap">
              <Link to="/docs/getting-started/introduction">
                <Button variant="primary" size="lg">{translate({ id: "orb.hero.cta1", message: "Get Started" })}</Button>
              </Link>
              <Link to="/playground">
                <Button variant="secondary" size="lg">{translate({ id: "orb.hero.cta2", message: "Standard Library" })}</Button>
              </Link>
            </HStack>
          </VStack>
        </Box>
      </Box>

      {/* Split: One File, Full Application */}
      <Box className="w-full">
        <Box className="site-container py-24">
          <HStack gap="xl" className="flex-col lg:flex-row items-start w-full">
            <AnimatedReveal animation="fade-right" className="flex-1 min-w-0 w-full">
              <VStack gap="md">
                <Typography variant="h2">{translate({ id: "orb.example.title", message: "One File, Full Application" })}</Typography>
                <Typography variant="body1" color="muted">{translate({ id: "orb.example.subtitle", message: "A task manager in one file: the entity, its state machine, and the page. Every transition carries its own effects, so the compiler can see the whole circuit and generate the frontend, backend, and database from it." })}</Typography>
              </VStack>
            </AnimatedReveal>
            {/* threshold 0: the code/preview block is taller than the viewport,
                so the default 0.15 area-ratio can never be met and the reveal
                would never fire on desktop. Trigger as soon as it scrolls in. */}
            <AnimatedReveal animation="fade-left" threshold={0} className="flex-1 lg:flex-[2] min-w-0 w-full">
              <CodePreviewTabs
                code={HOME_EXAMPLE_CODE}
                language="lolo"
                title="task-manager.orb"
                schema={HOME_EXAMPLE_SCHEMA}
              />
            </AnimatedReveal>
          </HStack>
        </Box>
      </Box>

      {/* Why .orb? */}
      <Box className="w-full bg-[var(--color-surface)]">
        <Box className="site-container py-24">
          <VStack gap="lg" align="center" className="w-full">
            <AnimatedReveal animation="fade-in">
              <Typography variant="h2">
                <Translate id="orb.why.title">Why .orb?</Translate>
              </Typography>
            </AnimatedReveal>
            <SimpleGrid cols={3} gap="lg" className="!grid-cols-1 sm:!grid-cols-3">
              {WHY_FEATURES.map((f, i) => (
                <AnimatedReveal key={f.title} animation="fade-up" delay={i * 100} className="h-full">
                  <Card className="p-6 h-full">
                    <VStack gap="sm">
                      <Icon name={f.icon} size="lg" className="text-[var(--color-primary)]" />
                      <Typography variant="h4">{f.title}</Typography>
                      <Typography variant="body2" color="muted">{f.description}</Typography>
                    </VStack>
                  </Card>
                </AnimatedReveal>
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
                <AnimatedReveal animation="fade-in">
                  <Typography variant="h2">{translate({ id: "orb.stdlib.title", message: "Standard Library" })}</Typography>
                </AnimatedReveal>
                <Typography variant="body1" color="muted">{translate({ id: "orb.stdlib.subtitle", message: "Behaviors are state machines you import. A list page, a wizard, a calendar, a kanban board: bind one to your entity, configure its knobs, rename its events. The topology stays fixed and the compiler checks every wire. Commerce, healthcare, education, games, and more." })}</Typography>
                <HStack gap="sm" className="flex-wrap mt-2">
                  {DOMAIN_TAGS.map((tag, i) => (
                    <AnimatedReveal key={tag} animation="scale" delay={i * 30}>
                      <Badge variant="primary">{tag}</Badge>
                    </AnimatedReveal>
                  ))}
                </HStack>
                <Box className="mt-2">
                  <Link to="/playground">
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
      <Box className="w-full bg-[var(--color-surface)]">
        <AnimatedReveal animation="fade-up">
          <Box className="site-container py-24">
            <VStack gap="lg" align="center" className="w-full">
              <Typography variant="h2">
                <Translate id="orb.community.title">Open Source Community</Translate>
              </Typography>
              <Typography variant="body1" color="muted">
                <Translate id="orb.community.subtitle">Orb and its compiler are open source. Contribute, report issues, or build something new.</Translate>
              </Typography>
              <HStack gap="md" className="flex-wrap">
                <a href="https://github.com/almadar-io/orb" target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="lg" leftIcon="github">
                    GitHub
                  </Button>
                </a>
                <a href="https://discord.gg/q83VjPJx" target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="lg" leftIcon="message-circle">
                    Discord
                  </Button>
                </a>
              </HStack>
            </VStack>
          </Box>
        </AnimatedReveal>
      </Box>
    </Layout>
  );
}
