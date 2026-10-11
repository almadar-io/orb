# Homebrew formula for Orb CLI
# To use: brew install almadar-io/tap/orb

class Orb < Formula
  desc "Compile Orbital schemas to full-stack applications"
  homepage "https://orb.almadar.io"
  version "1.0.0"
  license "MIT"

  on_macos do
    on_intel do
      url "https://github.com/almadar-io/almadar/releases/download/v#{version}/orb-darwin-x64.tar.gz"
      sha256 "REPLACE_WITH_ACTUAL_SHA256"
    end
    on_arm do
      url "https://github.com/almadar-io/almadar/releases/download/v#{version}/orb-darwin-arm64.tar.gz"
      sha256 "REPLACE_WITH_ACTUAL_SHA256"
    end
  end

  on_linux do
    on_intel do
      url "https://github.com/almadar-io/almadar/releases/download/v#{version}/orb-linux-x64.tar.gz"
      sha256 "REPLACE_WITH_ACTUAL_SHA256"
    end
    on_arm do
      url "https://github.com/almadar-io/almadar/releases/download/v#{version}/orb-linux-arm64.tar.gz"
      sha256 "REPLACE_WITH_ACTUAL_SHA256"
    end
  end

  def install
    # orb and its bundled bun side by side, so orb finds bun to set the
    # language up (~/.orb) on its first command; only orb goes on PATH.
    libexec.install "orb"
    libexec.install "bun" if File.exist?("bun")
    bin.write_exec_script libexec/"orb"
  end

  def caveats
    <<~EOS
      orb sets the language up in ~/.orb on its first command
      (or run: orb update --global).
    EOS
  end

  test do
    assert_match "Orbital schema compiler", shell_output("#{bin}/orb --help")
  end
end
