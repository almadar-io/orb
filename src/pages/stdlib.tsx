import React from "react";
import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import Translate, { translate } from "@docusaurus/Translate";
import styles from "./stdlib.module.css";

function Hero() {
  return (
    <header className={styles.hero}>
      <div className="container">
        <Heading as="h1" className={styles.heroTitle}>
          <Translate id="stdlib.hero.title">Standard Library</Translate>
        </Heading>
        <p className={styles.heroSubtitle}>
          <Translate id="stdlib.hero.subtitle">
            103 production-quality behaviors across 18 domains. Import and compose them into your .orb programs.
          </Translate>
        </p>
      </div>
    </header>
  );
}

const DOMAINS = [
  { name: "Commerce", count: 8 },
  { name: "Healthcare", count: 7 },
  { name: "Education", count: 6 },
  { name: "Finance", count: 7 },
  { name: "Scheduling", count: 6 },
  { name: "Workflow", count: 6 },
  { name: "Social", count: 6 },
  { name: "Media", count: 5 },
  { name: "Gaming", count: 6 },
  { name: "IoT", count: 5 },
  { name: "CRM", count: 6 },
  { name: "Analytics", count: 5 },
  { name: "Communication", count: 6 },
  { name: "Content", count: 5 },
  { name: "Location", count: 5 },
  { name: "HR", count: 5 },
  { name: "Legal", count: 5 },
  { name: "Real Estate", count: 4 },
];

function DomainsGrid() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">
            <Translate id="stdlib.domains.title">18 Domains</Translate>
          </Heading>
          <p className={styles.sectionSubtitle}>
            <Translate id="stdlib.domains.subtitle">
              Each domain contains production-ready behaviors with entities, traits, and pages. Import what you need.
            </Translate>
          </p>
        </div>
        <div className={styles.domainsGrid}>
          {DOMAINS.map((domain) => (
            <div key={domain.name} className={styles.domainCard}>
              <h3>{domain.name}</h3>
              <span className={styles.domainCount}>{domain.count} behaviors</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowToUseSection() {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">
            <Translate id="stdlib.howto.title">How to Use</Translate>
          </Heading>
        </div>
        <div className={styles.howtoContent}>
          <p>
            <Translate id="stdlib.howto.p1">
              Standard library behaviors are distributed as part of the @almadar/std package. Reference them in your .orb program by domain and name. The compiler resolves imports and validates compatibility.
            </Translate>
          </p>
          <p>
            <Translate id="stdlib.howto.p2">
              Each behavior is a complete unit: entity definitions, state machines, UI patterns, and event contracts. You can use them as-is or override specific parts to customize for your domain.
            </Translate>
          </p>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className={`${styles.section} ${styles.sectionDark}`}>
      <div className="container">
        <div className={styles.ctaContent}>
          <Heading as="h2" className={styles.ctaTitle}>
            <Translate id="stdlib.cta.title">Get Started</Translate>
          </Heading>
          <p className={styles.ctaText}>
            <Translate id="stdlib.cta.text">
              Install the CLI and start building with the standard library.
            </Translate>
          </p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/docs/getting-started/introduction">
              <Translate id="stdlib.cta.docs">Read the Docs</Translate>
            </Link>
            <Link className="button button--secondary button--lg" to="/downloads">
              <Translate id="stdlib.cta.download">Download</Translate>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function StdLib(): ReactNode {
  return (
    <Layout
      title={translate({ id: "stdlib.meta.title", message: "Standard Library — 103 Behaviors, 18 Domains" })}
      description={translate({ id: "stdlib.meta.desc", message: "Production-quality behaviors for Commerce, Healthcare, Education, Finance, Scheduling, and 13 more domains." })}
    >
      <Hero />
      <main>
        <DomainsGrid />
        <HowToUseSection />
        <CTASection />
      </main>
    </Layout>
  );
}
