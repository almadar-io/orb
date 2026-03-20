import React from "react";
import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import Translate, { translate } from "@docusaurus/Translate";
import styles from "./downloads.module.css";

function Hero() {
  return (
    <header className={styles.hero}>
      <div className="container">
        <Heading as="h1" className={styles.heroTitle}>
          <Translate id="downloads.hero.title">Downloads</Translate>
        </Heading>
        <p className={styles.heroSubtitle}>
          <Translate id="downloads.hero.subtitle">
            Get the CLI, editor extensions, and start building.
          </Translate>
        </p>
      </div>
    </header>
  );
}

function CLISection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className="row align-items--center">
          <div className="col col--6">
            <div className={styles.downloadCard}>
              <div className={styles.downloadInfo}>
                <h2><Translate id="downloads.cli.title">Orbital CLI</Translate></h2>
                <p>
                  <Translate id="downloads.cli.desc">
                    The command-line compiler and development server. Validate, compile, and run .orb programs locally.
                  </Translate>
                </p>
              </div>
              <div className={styles.installBox}>
                <code>curl -fsSL https://orb.almadar.io/install.sh | sh</code>
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
            </div>
          </div>
          <div className="col col--6">
            <img 
              src="/img/downloads-platforms.png" 
              alt="Supported Platforms" 
              style={{ maxWidth: "100%", height: "auto", display: "block", margin: "0 auto" }} 
            />
          </div>
        </div>
      </div>
    </section>
  );
}

const EXTENSIONS = [
  {
    titleId: "downloads.vscode.title", title: "VS Code Extension",
    descId: "downloads.vscode.desc", desc: "Syntax highlighting, validation, and S-expression support for .orb files in Visual Studio Code.",
    linkId: "downloads.vscode.link", linkText: "Install from Marketplace",
    href: "https://marketplace.visualstudio.com/items?itemName=almadar.orb",
  },
  {
    titleId: "downloads.zed.title", title: "Zed Extension",
    descId: "downloads.zed.desc", desc: "Native .orb support for the Zed editor. Syntax highlighting and Tree-sitter grammar.",
    linkId: "downloads.zed.link", linkText: "View on GitHub",
    href: "https://github.com/almadar-io/zed-orbital",
  },
];

function ExtensionsSection() {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">
            <Translate id="downloads.extensions.title">Editor Extensions</Translate>
          </Heading>
        </div>
        <div className={styles.extensionsGrid}>
          {EXTENSIONS.map((ext) => (
            <div key={ext.titleId} className={styles.extensionCard}>
              <h3><Translate id={ext.titleId}>{ext.title}</Translate></h3>
              <p><Translate id={ext.descId}>{ext.desc}</Translate></p>
              <Link href={ext.href} className={styles.extensionLink}>
                <Translate id={ext.linkId}>{ext.linkText}</Translate> &rarr;
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NextStepsSection() {
  return (
    <section className={`${styles.section} ${styles.sectionDark}`}>
      <div className="container">
        <div className={styles.ctaContent}>
          <Heading as="h2" className={styles.ctaTitle}>
            <Translate id="downloads.next.title">Next Steps</Translate>
          </Heading>
          <p className={styles.ctaText}>
            <Translate id="downloads.next.text">
              Install the CLI, then follow the getting started guide to build your first .orb application.
            </Translate>
          </p>
          <Link className="button button--primary button--lg" to="/docs/getting-started/introduction">
            <Translate id="downloads.next.cta">Getting Started Guide</Translate>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Downloads(): ReactNode {
  return (
    <Layout
      title={translate({ id: "downloads.meta.title", message: "Downloads — CLI & Editor Extensions" })}
      description={translate({ id: "downloads.meta.desc", message: "Download the Orbital CLI, VS Code extension, and Zed extension." })}
    >
      <Hero />
      <main>
        <CLISection />
        <ExtensionsSection />
        <NextStepsSection />
      </main>
    </Layout>
  );
}
