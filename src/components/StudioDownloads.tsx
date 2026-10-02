import React from "react";
import type { ReactNode } from "react";
import { translate } from "@docusaurus/Translate";
import { Box, VStack, HStack, Typography, Button, Card, Icon, SimpleGrid } from "@almadar/ui/ssr";
import release from "@site/src/data/studio-release.json";

/** One installer of a Studio release (written by the almadar-studio release job). */
interface StudioInstaller {
  os: string;
  arch: string;
  file: string;
  url: string;
  size: number;
  sha256: string;
}

interface StudioRelease {
  version: string | null;
  tag: string | null;
  releasedAt: string | null;
  installers: StudioInstaller[];
}

type Os = "mac" | "win" | "linux";

const PLATFORMS: { os: Os; icon: string; title: string; note: string }[] = [
  {
    os: "mac",
    icon: "apple",
    title: translate({ id: "downloads.studio.mac", message: "macOS" }),
    note: translate({
      id: "downloads.studio.note.mac",
      message: "First launch: macOS says the app can't be verified. Open System Settings → Privacy & Security and click “Open Anyway”.",
    }),
  },
  {
    os: "win",
    icon: "monitor",
    title: translate({ id: "downloads.studio.windows", message: "Windows" }),
    note: translate({
      id: "downloads.studio.note.win",
      message: "First launch: if SmartScreen appears, click “More info”, then “Run anyway”.",
    }),
  },
  {
    os: "linux",
    icon: "terminal",
    title: translate({ id: "downloads.studio.linux", message: "Linux" }),
    note: translate({
      id: "downloads.studio.note.linux",
      message: "Make the AppImage executable (chmod +x), then run it.",
    }),
  },
];

/** macOS buyers know chips, not ISAs; Windows and Linux users know the ISA. */
function archLabel(os: string, arch: string): string {
  if (os === "mac") {
    return arch === "arm64"
      ? translate({ id: "downloads.studio.arch.appleSilicon", message: "Apple Silicon" })
      : translate({ id: "downloads.studio.arch.intel", message: "Intel" });
  }
  return arch === "arm64" ? "ARM64" : "x64";
}

function megabytes(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

export default function StudioDownloads(): ReactNode {
  const data: StudioRelease = release;

  return (
    <Box className="w-full">
      <Box className="site-container py-20">
        <VStack gap="md" align="start" className="mb-10">
          <Typography variant="h2">{translate({ id: "downloads.studio.title", message: "Almadar Studio" })}</Typography>
          <Typography variant="body1" color="muted">
            {translate({
              id: "downloads.studio.desc",
              message: "The visual builder as a desktop app, running fully on your machine. Double-click any .orb or .lolo file to run it.",
            })}
          </Typography>
          {data.version ? (
            <Typography variant="body2" color="muted">
              {translate({ id: "downloads.studio.version", message: "Version {version}" }, { version: data.version })}
            </Typography>
          ) : null}
        </VStack>

        {data.installers.length === 0 ? (
          <Typography variant="body1">
            {translate({ id: "downloads.studio.comingSoon", message: "The first desktop release is on its way." })}
          </Typography>
        ) : (
          <SimpleGrid cols={3} gap="lg" className="!grid-cols-1 md:!grid-cols-3">
            {PLATFORMS.map((platform) => {
              const installers = data.installers.filter((i) => i.os === platform.os);
              if (installers.length === 0) return null;
              return (
                <Card key={platform.os} className="p-6">
                  <VStack gap="sm">
                    <HStack gap="sm" align="center">
                      <Icon name={platform.icon} size="lg" className="text-primary" />
                      <Typography variant="h4">{platform.title}</Typography>
                    </HStack>
                    {installers.map((installer) => (
                      <Button
                        key={installer.file}
                        href={installer.url}
                        variant="primary"
                        size="sm"
                        leftIcon="download"
                      >
                        {`${archLabel(installer.os, installer.arch)} · ${megabytes(installer.size)}`}
                      </Button>
                    ))}
                    <Typography variant="caption" color="muted">{platform.note}</Typography>
                  </VStack>
                </Card>
              );
            })}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
}
