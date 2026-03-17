'use client';
import React from "react";
import { Outlet, Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import { useTranslate } from "../../hooks/useTranslate";
import { Box } from "../atoms/Box";
import { VStack, HStack } from "../atoms/Stack";
import { Typography } from "../atoms/Typography";

export interface AuthLayoutProps {
  /** App name */
  appName?: string;
  /** Logo component or URL */
  logo?: React.ReactNode;
  /** Background image URL */
  backgroundImage?: string;
  /** Show branding panel on the side */
  showBranding?: boolean;
  /** Branding panel content */
  brandingContent?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  appName = "{{APP_TITLE}}",
  logo,
  backgroundImage,
  showBranding = true,
  brandingContent,
}) => {
  const { t } = useTranslate();

  return (
    <Box className="min-h-screen flex">
      {/* Branding panel (desktop only) */}
      {showBranding && (
        <VStack
          className={cn(
            "hidden lg:flex lg:w-1/2 bg-primary-600 relative overflow-hidden",
            "justify-between p-12",
          )}
          style={
            backgroundImage
              ? {
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: "cover",
                }
              : undefined
          }
          gap="none"
        >
          {/* Gradient overlay */}
          <Box className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-primary-800/90" />

          {/* Content */}
          <Box className="relative z-10">
            <Link to="/" className="flex items-center gap-3">
              {logo || (
                <Box className="w-10 h-10 bg-white/20 rounded-[var(--radius-xl)] flex items-center justify-center backdrop-blur">
                  <Typography
                    variant="body1"
                    className="text-white font-bold text-lg"
                  >
                    {appName.charAt(0).toUpperCase()}
                  </Typography>
                </Box>
              )}
              <Typography
                variant="body1"
                className="text-2xl font-bold text-white"
              >
                {appName}
              </Typography>
            </Link>
          </Box>

          {/* Custom branding content or default */}
          <Box className="relative z-10">
            {brandingContent || (
              <VStack gap="lg">
                <Typography
                  variant="h1"
                  className="text-4xl font-bold text-white leading-tight"
                >
                  Welcome to {appName}
                </Typography>
                <Typography
                  variant="body1"
                  className="text-lg text-white/80 max-w-md"
                >
                  Sign in to access your dashboard and manage your account.
                </Typography>

                {/* Testimonial or feature list */}
                <Box className="mt-12 p-6 bg-white/10 rounded-[var(--radius-xl)] backdrop-blur">
                  <Typography
                    variant="body1"
                    className="text-white/90 italic"
                  >
                    &quot;This platform has transformed how we work. Highly
                    recommended!&quot;
                  </Typography>
                  <HStack className="mt-4" gap="sm" align="center">
                    <Box className="w-10 h-10 bg-white/20 rounded-[var(--radius-full)]" />
                    <VStack gap="none">
                      <Typography
                        variant="body1"
                        className="text-white font-medium"
                      >
                        Jane Doe
                      </Typography>
                      <Typography
                        variant="body1"
                        className="text-white/60 text-sm"
                      >
                        CEO, Example Co.
                      </Typography>
                    </VStack>
                  </HStack>
                </Box>
              </VStack>
            )}
          </Box>

          {/* Decorative elements */}
          <Box className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/5 rounded-[var(--radius-full)]" />
          <Box className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-[var(--radius-full)]" />
        </VStack>
      )}

      {/* Auth form panel */}
      <Box
        className={cn(
          "flex-1 flex items-center justify-center p-6 sm:p-12",
          "bg-[var(--color-background)]",
        )}
      >
        <Box className="w-full max-w-md">
          {/* Mobile logo */}
          <Box className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-3">
              {logo || (
                <Box className="w-12 h-12 bg-primary-600 rounded-[var(--radius-xl)] flex items-center justify-center">
                  <Typography
                    variant="body1"
                    className="text-white font-bold text-xl"
                  >
                    {appName.charAt(0).toUpperCase()}
                  </Typography>
                </Box>
              )}
              <Typography
                variant="body1"
                className="text-2xl font-bold text-[var(--color-foreground)]"
              >
                {appName}
              </Typography>
            </Link>
          </Box>

          {/* Auth form content (from child routes) */}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

AuthLayout.displayName = "AuthLayout";
