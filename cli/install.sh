#!/bin/sh
# Orb CLI Installer
# https://orb.almadar.io
#
# Usage:
#   curl -fsSL https://orb.almadar.io/install.sh | sh
#   curl -fsSL https://orb.almadar.io/install.sh | sh -s -- --version v1.0.0
#
# Environment variables:
#   ORB_INSTALL_DIR - Installation directory (default: ~/.orb/bin)
#   ORB_VERSION     - Version to install (default: latest)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
INSTALL_DIR="${ORB_INSTALL_DIR:-$HOME/.orb/bin}"
VERSION="${ORB_VERSION:-latest}"
GITHUB_REPO="almadar-io/almadar"

# Parse arguments
while [ $# -gt 0 ]; do
  case "$1" in
    --version)
      VERSION="$2"
      shift 2
      ;;
    --install-dir)
      INSTALL_DIR="$2"
      shift 2
      ;;
    --help)
      echo "Orb CLI Installer"
      echo ""
      echo "Usage: install.sh [options]"
      echo ""
      echo "Options:"
      echo "  --version <version>     Version to install (default: latest)"
      echo "  --install-dir <dir>     Installation directory (default: ~/.orb/bin)"
      echo "  --help                  Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Detect platform
detect_platform() {
  OS="$(uname -s)"
  ARCH="$(uname -m)"

  case "$OS" in
    Linux*)
      PLATFORM="linux"
      ;;
    Darwin*)
      PLATFORM="darwin"
      ;;
    MINGW*|MSYS*|CYGWIN*)
      PLATFORM="windows"
      ;;
    *)
      echo "${RED}Unsupported operating system: $OS${NC}"
      exit 1
      ;;
  esac

  case "$ARCH" in
    x86_64|amd64)
      ARCH="x64"
      ;;
    arm64|aarch64)
      ARCH="arm64"
      ;;
    *)
      echo "${RED}Unsupported architecture: $ARCH${NC}"
      exit 1
      ;;
  esac

  echo "${PLATFORM}-${ARCH}"
}

# Get latest version from GitHub
get_latest_version() {
  if command -v curl > /dev/null 2>&1; then
    curl -fsSL "https://api.github.com/repos/${GITHUB_REPO}/releases/latest" | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/'
  elif command -v wget > /dev/null 2>&1; then
    wget -qO- "https://api.github.com/repos/${GITHUB_REPO}/releases/latest" | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/'
  else
    echo "${RED}Error: curl or wget is required${NC}"
    exit 1
  fi
}

# Download and install
install() {
  PLATFORM_ARCH=$(detect_platform)

  echo "${BLUE}Orb CLI Installer${NC}"
  echo ""

  # Get version
  if [ "$VERSION" = "latest" ]; then
    echo "Fetching latest version..."
    VERSION=$(get_latest_version)
    if [ -z "$VERSION" ]; then
      echo "${RED}Failed to get latest version${NC}"
      exit 1
    fi
  fi

  echo "Platform: ${PLATFORM_ARCH}"
  echo "Version: ${VERSION}"
  echo "Install directory: ${INSTALL_DIR}"
  echo ""

  # Construct download URL
  if [ "$PLATFORM" = "windows" ]; then
    FILENAME="orb-${PLATFORM_ARCH}.zip"
  else
    FILENAME="orb-${PLATFORM_ARCH}.tar.gz"
  fi

  DOWNLOAD_URL="https://github.com/${GITHUB_REPO}/releases/download/${VERSION}/${FILENAME}"

  # Create temp directory
  TMP_DIR=$(mktemp -d)
  trap "rm -rf $TMP_DIR" EXIT

  # Download
  echo "Downloading ${FILENAME}..."
  if command -v curl > /dev/null 2>&1; then
    curl -fsSL "$DOWNLOAD_URL" -o "$TMP_DIR/$FILENAME"
  elif command -v wget > /dev/null 2>&1; then
    wget -q "$DOWNLOAD_URL" -O "$TMP_DIR/$FILENAME"
  fi

  if [ ! -f "$TMP_DIR/$FILENAME" ]; then
    echo "${RED}Failed to download from: $DOWNLOAD_URL${NC}"
    exit 1
  fi

  # Extract
  echo "Extracting..."
  cd "$TMP_DIR"
  if [ "$PLATFORM" = "windows" ]; then
    unzip -q "$FILENAME"
  else
    tar -xzf "$FILENAME"
  fi

  # Install
  echo "Installing to ${INSTALL_DIR}..."
  mkdir -p "$INSTALL_DIR"

  if [ "$PLATFORM" = "windows" ]; then
    mv orb.exe "$INSTALL_DIR/"
  else
    mv orb "$INSTALL_DIR/"
    chmod +x "$INSTALL_DIR/orb"
  fi

  echo ""
  echo "${GREEN}Orb CLI installed successfully!${NC}"
  echo ""

  # Check if in PATH
  case ":$PATH:" in
    *":$INSTALL_DIR:"*)
      echo "Run 'orb --help' to get started."
      ;;
    *)
      echo "${YELLOW}Add the following to your shell profile (~/.bashrc, ~/.zshrc, etc.):${NC}"
      echo ""
      echo "  export PATH=\"\$PATH:$INSTALL_DIR\""
      echo ""
      echo "Then run 'orb --help' to get started."
      ;;
  esac
}

install
