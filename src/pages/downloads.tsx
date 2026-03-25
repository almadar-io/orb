import React from "react";
import type { ReactNode } from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import { translate } from "@docusaurus/Translate";
import {
  Box,
  VStack,
  HStack,
  Typography,
  Button,
  Card,
  Icon,
  SimpleGrid,
} from "@almadar/ui/marketing";
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

const EXTENSIONS = [
  {
    title: translate({ id: "downloads.vscode.title", message: "VS Code Extension" }),
    description: translate({ id: "downloads.vscode.desc", message: "Syntax highlighting, validation, and S-expression support for .orb files in Visual Studio Code." }),
    href: "https://marketplace.visualstudio.com/items?itemName=almadar.orb",
    linkLabel: translate({ id: "downloads.vscode.link", message: "Install from Marketplace" }),
  },
  {
    title: translate({ id: "downloads.zed.title", message: "Zed Extension" }),
    description: translate({ id: "downloads.zed.desc", message: "Native .orb support for the Zed editor. Syntax highlighting and Tree-sitter grammar." }),
    href: "https://github.com/almadar-io/zed-orbital",
    linkLabel: translate({ id: "downloads.zed.link", message: "View on GitHub" }),
  },
];

export default function Downloads(): ReactNode {
  return (
    <Layout
      title={translate({ id: "downloads.meta.title", message: "Downloads — CLI & Editor Extensions" })}
      description={translate({ id: "downloads.meta.desc", message: "Download the Orbital CLI, VS Code extension, and Zed extension." })}
    >
      {/* Hero + CLI combined */}
      <Box className="w-full">
        <Box className="site-container py-20">
          <VStack gap="lg" align="start" className="mb-12">
            <Typography variant="h1">{translate({ id: "downloads.hero.title", message: "Downloads" })}</Typography>
            <Typography variant="body1" color="muted">{translate({ id: "downloads.hero.subtitle", message: "Get the CLI, editor extensions, and start building." })}</Typography>
          </VStack>
          <HStack gap="xl" className="flex-col lg:flex-row items-center">
            <Box className="flex-1">
              <VStack gap="md">
                <Typography variant="h2">{translate({ id: "downloads.cli.title", message: "Orbital CLI" })}</Typography>
                <Typography variant="body1" color="muted">{translate({ id: "downloads.cli.desc", message: "The command-line compiler and development server. Validate, compile, and run .orb programs locally." })}</Typography>
                <Box className="font-mono text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3 select-all">
                  curl -fsSL https://orb.almadar.io/install.sh | sh
                </Box>
                <HStack gap="md" className="mt-4">
                  {[
                    { name: "macOS", icon: "apple" },
                    { name: "Linux", icon: "terminal" },
                    { name: "Windows", icon: "monitor" },
                  ].map((platform) => (
                    <Card key={platform.name} className="p-4 flex-1">
                      <VStack gap="xs" align="center">
                        <Icon name={platform.icon} size={24} className="text-primary" />
                        <Typography variant="body2">{platform.name}</Typography>
                      </VStack>
                    </Card>
                  ))}
                </HStack>
              </VStack>
            </Box>
            <Box className="flex-1 flex justify-center" style={{ maxWidth: 300 }}>
              <ThemedImage
                alt="Orb Entity Download"
                sources={{
                  light: useBaseUrl('/img/illustrations/Entity-light.svg'),
                  dark: useBaseUrl('/img/illustrations/Entity-dark.svg'),
                }}
                className="w-full opacity-90 drop-shadow-2xl"
              />
            </Box>
          </HStack>
        </Box>
      </Box>

      {/* Editor Extensions */}
      <Box className="w-full bg-[var(--color-surface)]">
        <Box className="site-container py-24">
          <SimpleGrid cols={2} gap="lg">
            {EXTENSIONS.map((ext) => (
              <Card key={ext.title} className="p-6">
                <VStack gap="sm">
                  <Typography variant="h4">{ext.title}</Typography>
                  <Typography variant="body2" color="muted">{ext.description}</Typography>
                  <a href={ext.href} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm" leftIcon="external-link">
                      {ext.linkLabel}
                    </Button>
                  </a>
                </VStack>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* CTA: Next Steps */}
      <Box className="w-full bg-[var(--color-surface)]">
        <Box className="site-container py-24">
          <VStack gap="lg" align="center">
            <Typography variant="h2">{translate({ id: "downloads.next.title", message: "Next Steps" })}</Typography>
            <Typography variant="body1" color="muted">{translate({ id: "downloads.next.text", message: "Install the CLI, then follow the getting started guide to build your first .orb application." })}</Typography>
            <Link to="/docs/getting-started/introduction">
              <Button variant="primary" size="lg">{translate({ id: "downloads.next.cta", message: "Getting Started Guide" })}</Button>
            </Link>
          </VStack>
        </Box>
      </Box>
    </Layout>
  );
}
