import React from "react";
import type { ReactNode } from "react";
import Layout from "@theme/Layout";
import { translate } from "@docusaurus/Translate";
import {
  HeroSection,
  SplitSection,
  InstallBox,
  FeatureGrid,
  CTABanner,
  ContentSection,
} from "@almadar/ui/marketing";

const EXTENSIONS = [
  {
    title: translate({ id: "downloads.vscode.title", message: "VS Code Extension" }),
    description: translate({ id: "downloads.vscode.desc", message: "Syntax highlighting, validation, and S-expression support for .orb files in Visual Studio Code." }),
    href: "https://marketplace.visualstudio.com/items?itemName=almadar.orb",
    linkLabel: translate({ id: "downloads.vscode.link", message: "Install from Marketplace" }),
    variant: "interactive" as const,
  },
  {
    title: translate({ id: "downloads.zed.title", message: "Zed Extension" }),
    description: translate({ id: "downloads.zed.desc", message: "Native .orb support for the Zed editor. Syntax highlighting and Tree-sitter grammar." }),
    href: "https://github.com/almadar-io/zed-orbital",
    linkLabel: translate({ id: "downloads.zed.link", message: "View on GitHub" }),
    variant: "interactive" as const,
  },
];

export default function Downloads(): ReactNode {
  return (
    <Layout
      title={translate({ id: "downloads.meta.title", message: "Downloads — CLI & Editor Extensions" })}
      description={translate({ id: "downloads.meta.desc", message: "Download the Orbital CLI, VS Code extension, and Zed extension." })}
    >
      <HeroSection
        title={translate({ id: "downloads.hero.title", message: "Downloads" })}
        subtitle={translate({ id: "downloads.hero.subtitle", message: "Get the CLI, editor extensions, and start building." })}
      />

      <ContentSection>
        <SplitSection
          title={translate({ id: "downloads.cli.title", message: "Orbital CLI" })}
          description={translate({ id: "downloads.cli.desc", message: "The command-line compiler and development server. Validate, compile, and run .orb programs locally." })}
          image={{ src: "/img/downloads-platforms.png", alt: "Supported Platforms" }}
          imagePosition="right"
        >
          <InstallBox command="curl -fsSL https://orb.almadar.io/install.sh | sh" />
        </SplitSection>
      </ContentSection>

      <ContentSection background="alt">
        <FeatureGrid items={EXTENSIONS} columns={2} />
      </ContentSection>

      <CTABanner
        title={translate({ id: "downloads.next.title", message: "Next Steps" })}
        subtitle={translate({ id: "downloads.next.text", message: "Install the CLI, then follow the getting started guide to build your first .orb application." })}
        primaryAction={{ label: translate({ id: "downloads.next.cta", message: "Getting Started Guide" }), href: "/docs/getting-started/introduction" }}
        background="dark"
      />
    </Layout>
  );
}
