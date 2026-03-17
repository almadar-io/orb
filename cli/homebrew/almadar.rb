# Homebrew formula for Almadar CLI
# To use: brew install almadar-io/tap/almadar

class Almadar < Formula
  desc "Compile Orbital schemas to full-stack applications"
  homepage "https://almadar.io"
  version "1.0.0"
  license "MIT"

  on_macos do
    on_intel do
      url "https://github.com/almadar-io/almadar/releases/download/v#{version}/almadar-darwin-x64.tar.gz"
      sha256 "REPLACE_WITH_ACTUAL_SHA256"
    end
    on_arm do
      url "https://github.com/almadar-io/almadar/releases/download/v#{version}/almadar-darwin-arm64.tar.gz"
      sha256 "REPLACE_WITH_ACTUAL_SHA256"
    end
  end

  on_linux do
    on_intel do
      url "https://github.com/almadar-io/almadar/releases/download/v#{version}/almadar-linux-x64.tar.gz"
      sha256 "REPLACE_WITH_ACTUAL_SHA256"
    end
    on_arm do
      url "https://github.com/almadar-io/almadar/releases/download/v#{version}/almadar-linux-arm64.tar.gz"
      sha256 "REPLACE_WITH_ACTUAL_SHA256"
    end
  end

  def install
    bin.install "almadar"
  end

  test do
    assert_match "Orbital schema compiler", shell_output("#{bin}/almadar --help")
  end
end
