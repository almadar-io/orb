import React from "react";
import Link from "@docusaurus/Link";
import {
  Box,
  VStack,
  Typography,
  Button,
} from "@almadar/ui/marketing";

export default function NotFoundContent(): React.ReactNode {
  return (
    <Box className="w-full">
      <Box className="site-container py-24">
        <VStack gap="md" align="center" className="min-h-[60vh] justify-center">
          <Box className="font-mono text-sm bg-[var(--ifm-color-emphasis-100)] rounded-lg p-6 text-left leading-[1.8]" style={{ maxWidth: 420 }}>
            <Typography variant="body2" className="text-[var(--ifm-color-emphasis-500)]">{"// 404: undefined"}</Typography>
            <Typography variant="body2"><Box as="span" className="text-[var(--ifm-color-danger)] font-semibold">error</Box>{": page not found"}</Typography>
            <Typography variant="body2" className="text-[var(--ifm-color-emphasis-500)]">{"// did you mean: /"}</Typography>
          </Box>
          <Typography variant="h3">This route doesn't resolve</Typography>
          <Typography variant="body1" color="muted" className="text-center" style={{ maxWidth: 480 }}>
            The page you requested isn't part of the Orb spec.
            Head back to the docs and try a different path.
          </Typography>
          <Link to="/">
            <Button variant="primary" size="lg">Back to Orb Docs</Button>
          </Link>
        </VStack>
      </Box>
    </Box>
  );
}
