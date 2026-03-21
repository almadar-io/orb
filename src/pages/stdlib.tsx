import React from "react";
import type { ReactNode } from "react";
import Layout from "@theme/Layout";
import Translate, { translate } from "@docusaurus/Translate";
import {
  HeroSection,
  ContentSection,
  FeatureGrid,
  TagCloud,
  ArticleSection,
  CTABanner,
  VStack,
  Typography,
  Box,
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
      <HeroSection
        title={translate({ id: "stdlib.hero.title", message: "Standard Library" })}
        subtitle={translate({ id: "stdlib.hero.subtitle", message: "103 production-quality behaviors across 18 domains. Import and compose them into your .orb programs." })}
      />

      <ContentSection>
        <VStack gap="lg" align="center" className="container">
          <Box className="w-full max-w-md mx-auto">
            <AvlOrbitalUnit
              entityName="auth-login"
              fields={4}
              traits={[{ name: "credentials" }, { name: "session" }]}
              pages={[{ name: "/login" }, { name: "/profile" }]}
            />
          </Box>
          <VStack gap="sm" align="center">
            <Typography variant="h2">
              <Translate id="stdlib.domains.title">18 Domains</Translate>
            </Typography>
            <Typography variant="body" color="muted">
              <Translate id="stdlib.domains.subtitle">Each domain contains production-ready behaviors with entities, traits, and pages. Import what you need.</Translate>
            </Typography>
          </VStack>
          <FeatureGrid items={DOMAINS} columns={4} gap="sm" />
        </VStack>
      </ContentSection>

      <ContentSection background="alt">
        <ArticleSection title={translate({ id: "stdlib.howto.title", message: "How to Use" })}>
          <Typography variant="body">
            <Translate id="stdlib.howto.p1">
              Standard library behaviors are distributed as part of the @almadar/std package. Reference them in your .orb program by domain and name. The compiler resolves imports and validates compatibility.
            </Translate>
          </Typography>
          <Typography variant="body">
            <Translate id="stdlib.howto.p2">
              Each behavior is a complete unit: entity definitions, state machines, UI patterns, and event contracts. You can use them as-is or override specific parts to customize for your domain.
            </Translate>
          </Typography>
        </ArticleSection>
      </ContentSection>

      <CTABanner
        title={translate({ id: "stdlib.cta.title", message: "Get Started" })}
        subtitle={translate({ id: "stdlib.cta.text", message: "Install the CLI and start building with the standard library." })}
        primaryAction={{ label: translate({ id: "stdlib.cta.docs", message: "Read the Docs" }), href: "/docs/getting-started/introduction" }}
        secondaryAction={{ label: translate({ id: "stdlib.cta.download", message: "Download" }), href: "/downloads" }}
        background="dark"
      />
    </Layout>
  );
}
