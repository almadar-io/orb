import React from "react";
import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import Translate, { translate } from "@docusaurus/Translate";
// BrowserOnly import removed (TryIt section removed)
import CodeBlock from "@theme/CodeBlock";
import { MonitorSmartphone, ShieldCheck, Bot } from "lucide-react";
import styles from "./index.module.css";

function Hero() {
  return (
    <header className={styles.hero}>
      <div className="container">
        <span className={styles.tag}>
          <Translate id="orb.hero.tag">Open Source</Translate>
        </span>
        <Heading as="h1" className={styles.heroTitle}>
          <Translate id="orb.hero.title">Orb</Translate>
        </Heading>
        <p className={styles.heroSubtitle}>
          <Translate id="orb.hero.subtitle">
            A formal language for describing how software systems behave. Write the model. The compiler proves it correct. AI generates and consumes it natively.
          </Translate>
        </p>
        <div className={styles.installBox}>
          <code id="install-cmd">curl -fsSL https://orb.almadar.io/install.sh | sh</code>
          <button
            className={styles.copyBtn}
            onClick={() => {
              navigator.clipboard.writeText("curl -fsSL https://orb.almadar.io/install.sh | sh");
              const btn = document.querySelector(`.${styles.copyBtn}`) as HTMLButtonElement;
              if (btn) { btn.textContent = "Copied!"; setTimeout(() => { btn.textContent = "Copy"; }, 2000); }
            }}
            aria-label="Copy install command"
          >
            Copy
          </button>
        </div>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/getting-started/introduction">
            <Translate id="orb.hero.cta1">Get Started</Translate>
          </Link>
          <Link className="button button--secondary button--lg" to="/stdlib">
            <Translate id="orb.hero.cta2">Standard Library</Translate>
          </Link>
        </div>
      </div>
    </header>
  );
}

const EXAMPLE_CODE = `{
  "entities": [{
    "name": "Task",
    "fields": [
      { "name": "title", "type": "string" },
      { "name": "status", "type": "string", "default": "pending" }
    ]
  }],
  "traits": [{
    "name": "TaskManager",
    "entity": "Task",
    "states": {
      "viewing": {
        "INIT": { "effects": [["fetch", "Task"]] },
        "ADD": { "target": "adding" }
      },
      "adding": {
        "render-ui": { "type": "form-section", "entity": "Task" },
        "SAVE": {
          "guards": [["validate/required", "@payload.title"]],
          "effects": [["persist", "Task", "@payload"]],
          "target": "viewing"
        }
      }
    }
  }]
}`;

function ExampleSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className="row align-items--center">
          <div className="col col--5">
            <div className={styles.sectionHeader} style={{ textAlign: "left", marginBottom: 0 }}>
              <Heading as="h2">
                <Translate id="orb.example.title">One File, Full Application</Translate>
              </Heading>
              <p className={styles.sectionSubtitle} style={{ margin: "1rem 0" }}>
                <Translate id="orb.example.subtitle">
                  A complete task manager in a single .orb file. The compiler generates frontend, backend, database, and API.
                </Translate>
              </p>
            </div>
            <img src="/img/hero-code-to-app.webp" alt="Code to app compilation" className={styles.sectionImage} loading="lazy" style={{ marginBottom: "2rem" }} />
          </div>
          <div className="col col--7">
            <div className={styles.codeWrapper}>
              <CodeBlock language="json" title="task-manager.orb">
                {EXAMPLE_CODE}
              </CodeBlock>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: <MonitorSmartphone size={32} strokeWidth={1.5} />,
    titleId: "orb.why.compile.title", title: "Write Once, Compile Anywhere",
    descId: "orb.why.compile.desc", desc: "One .orb model compiles to web, mobile, desktop, or any future platform. The behavior is platform-independent.",
  },
  {
    icon: <ShieldCheck size={32} strokeWidth={1.5} />,
    titleId: "orb.why.correct.title", title: "Provably Correct",
    descId: "orb.why.correct.desc", desc: "The compiler validates every state machine transition, every guard, every effect. If it compiles, it works.",
  },
  {
    icon: <Bot size={32} strokeWidth={1.5} />,
    titleId: "orb.why.ai.title", title: "AI Generates It Natively",
    descId: "orb.why.ai.desc", desc: "Structured, formal, and compact. AI models generate valid .orb programs more reliably than arbitrary code.",
  },
];

function WhySection() {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">
            <Translate id="orb.why.title">Why .orb?</Translate>
          </Heading>
        </div>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f) => (
            <div key={f.titleId} className={styles.featureCard}>
              <div style={{ marginBottom: "1rem" }}>{f.icon}</div>
              <h3><Translate id={f.titleId}>{f.title}</Translate></h3>
              <p><Translate id={f.descId}>{f.desc}</Translate></p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StdLibSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className="row align-items--center" style={{ minHeight: "350px" }}>
          <div className="col col--5">
            <div className={styles.sectionHeader} style={{ textAlign: "left", marginBottom: "2rem" }}>
              <Heading as="h2" style={{ marginTop: 0 }}>
                <Translate id="orb.stdlib.title">Standard Library</Translate>
              </Heading>
              <p className={styles.sectionSubtitle} style={{ margin: "1rem 0 0 0" }}>
                <Translate id="orb.stdlib.subtitle">
                  103 production-quality behaviors across 18 domains. Commerce, healthcare, education, finance, scheduling, workflow, and more.
                </Translate>
              </p>
            </div>
          </div>
          <div className="col col--7">
            <img src="/img/stdlib-domains.webp" alt="Standard Library Domains" className={styles.sectionImage} loading="lazy" style={{ margin: 0, height: "100%", objectFit: "contain" }} />
          </div>
        </div>
        <div className={styles.domainGrid} style={{ marginTop: "2rem" }}>
          {["Commerce", "Healthcare", "Education", "Finance", "Scheduling", "Workflow", "Social", "Media", "Gaming", "IoT", "CRM", "Analytics", "Communication", "Content", "Location", "HR", "Legal", "Real Estate"].map((domain) => (
            <span key={domain} className={styles.domainTag}>{domain}</span>
          ))}
        </div>
        <div className={styles.centered}>
          <Link className="button button--primary button--lg" to="/stdlib">
            <Translate id="orb.stdlib.cta">Browse the Standard Library</Translate>
          </Link>
        </div>
      </div>
    </section>
  );
}

// TryIt section removed

function CommunitySection() {
  return (
    <section className={`${styles.section} ${styles.sectionDark}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.lightText}>
            <Translate id="orb.community.title">Open Source Community</Translate>
          </Heading>
          <p className={`${styles.sectionSubtitle} ${styles.mutedText}`}>
            <Translate id="orb.community.subtitle">
              Orb and its compiler are open source. Contribute, report issues, or build something new.
            </Translate>
          </p>
        </div>
        <div className={styles.communityLinks}>
          <Link className="button button--primary button--lg" href="https://github.com/almadar-io/orb">GitHub</Link>
          <Link className="button button--secondary button--lg" href="https://discord.gg/q83VjPJx">Discord</Link>
        </div>
      </div>
    </section>
  );
}

export default function OrbHome(): ReactNode {
  return (
    <Layout
      title={translate({ id: "orb.meta.title", message: "Orb — A Programming Language for Formal World Models" })}
      description={translate({ id: "orb.meta.desc", message: "Orb describes how software systems behave. Write the model, the compiler proves it correct." })}
    >
      <Hero />
      <main>
        <ExampleSection />
        <WhySection />
        <StdLibSection />
        <CommunitySection />
      </main>
    </Layout>
  );
}
