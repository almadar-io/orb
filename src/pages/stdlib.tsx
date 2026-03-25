import React from "react";
import type { ReactNode } from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import Translate, { translate } from "@docusaurus/Translate";
import {
  Box,
  VStack,
  Typography,
  Button,
  Badge,
  Card,
  SimpleGrid,
  HStack,
} from "@almadar/ui/marketing";
import { AvlOrbitalUnit } from "@almadar/ui/illustrations";

const DOMAINS = [
  { title: "Commerce", description: "8 behaviors" },
  { title: "Healthcare", description: "7 behaviors" },
  { title: "Education", description: "6 behaviors" },
  { title: "Finance", description: "7 behaviors" },
  { title: "Scheduling", description: "6 behaviors" },
  { title: "Workflow", description: "6 behaviors" },
  { title: "Social", description: "6 behaviors" },
  { title: "Media", description: "5 behaviors" },
  { title: "Gaming", description: "6 behaviors" },
  { title: "IoT", description: "5 behaviors" },
  { title: "CRM", description: "6 behaviors" },
  { title: "Analytics", description: "5 behaviors" },
  { title: "Communication", description: "6 behaviors" },
  { title: "Content", description: "5 behaviors" },
  { title: "Location", description: "5 behaviors" },
  { title: "HR", description: "5 behaviors" },
  { title: "Legal", description: "5 behaviors" },
  { title: "Real Estate", description: "4 behaviors" },
];

export default function StdLib(): ReactNode {
  return (
    <Layout
      title={translate({ id: "stdlib.meta.title", message: "Standard Library — 103 Behaviors, 18 Domains" })}
      description={translate({ id: "stdlib.meta.desc", message: "Production-quality behaviors for Commerce, Healthcare, Education, Finance, Scheduling, and 13 more domains." })}
    >
      {/* Hero + Domains */}
      <Box className="w-full">
        <Box className="site-container py-20">
          <VStack gap="lg" align="start" className="mb-12">
            <Typography variant="h1">{translate({ id: "stdlib.hero.title", message: "Standard Library" })}</Typography>
            <Typography variant="body1" color="muted">{translate({ id: "stdlib.hero.subtitle", message: "103 production-quality behaviors across 18 domains. Import and compose them into your .orb programs." })}</Typography>
          </VStack>
          <HStack gap="xl" className="flex-col lg:flex-row items-center mb-12">
            <Box className="flex-1">
              <VStack gap="sm">
                <Typography variant="h2">
                  <Translate id="stdlib.domains.title">18 Domains</Translate>
                </Typography>
                <Typography variant="body1" color="muted">
                  <Translate id="stdlib.domains.subtitle">Each domain contains production-ready behaviors with entities, traits, and pages. Import what you need.</Translate>
                </Typography>
              </VStack>
            </Box>
            <Box className="flex-1 flex justify-center" style={{ maxWidth: 280 }}>
              <AvlOrbitalUnit
                entityName="auth-login"
                fields={4}
                traits={[{ name: "credentials" }, { name: "session" }]}
                pages={[{ name: "/login" }, { name: "/profile" }]}
              />
            </Box>
          </HStack>
          <SimpleGrid cols={3} gap="md">
            {DOMAINS.map((d) => (
              <Card key={d.title} className="p-6">
                <HStack className="justify-between items-center">
                  <Typography variant="h4">{d.title}</Typography>
                  <Badge variant="primary">{d.description}</Badge>
                </HStack>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* How to Use */}
      <Box className="w-full bg-[var(--color-surface)]">
        <Box className="site-container py-24">
          <VStack gap="lg">
            <Typography variant="h2">{translate({ id: "stdlib.howto.title", message: "How to Use" })}</Typography>
            <Typography variant="body1">
              <Translate id="stdlib.howto.p1">
                Standard library behaviors are distributed as part of the @almadar/std package. Reference them in your .orb program by domain and name. The compiler resolves imports and validates compatibility.
              </Translate>
            </Typography>
            <Typography variant="body1">
              <Translate id="stdlib.howto.p2">
                Each behavior is a complete unit: entity definitions, state machines, UI patterns, and event contracts. You can use them as-is or override specific parts to customize for your domain.
              </Translate>
            </Typography>
          </VStack>
        </Box>
      </Box>

      {/* CTA */}
      <Box className="w-full bg-[var(--color-foreground)] text-[var(--color-background)]">
        <Box className="site-container py-24">
          <VStack gap="lg" align="center">
            <Typography variant="h2" className="text-[var(--color-background)]">{translate({ id: "stdlib.cta.title", message: "Get Started" })}</Typography>
            <Typography variant="body1" className="text-[var(--color-background)]/60">{translate({ id: "stdlib.cta.text", message: "Install the CLI and start building with the standard library." })}</Typography>
            <HStack gap="md">
              <Link to="/docs/getting-started/introduction">
                <Button variant="primary" size="lg">{translate({ id: "stdlib.cta.docs", message: "Read the Docs" })}</Button>
              </Link>
              <Link to="/downloads">
                <Button variant="secondary" size="lg">{translate({ id: "stdlib.cta.download", message: "Download" })}</Button>
              </Link>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Layout>
  );
}
