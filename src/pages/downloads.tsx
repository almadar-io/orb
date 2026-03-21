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
  Box,
} from "@almadar/ui/marketing";
import { AvlApplication, AvlOrbital, AvlEntity } from "@almadar/ui/illustrations";

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
        <Box className="w-full max-w-lg mx-auto py-6">
          <svg viewBox="0 0 500 300" fill="none" className="w-full">
            <AvlApplication x={20} y={20} width={460} height={260} label="Application" />
            <AvlOrbital cx={250} cy={150} r={80} label="Orbital" />
            <AvlEntity x={250} y={150} r={25} fieldCount={5} label=".orb" />
          </svg>
        </Box>
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
