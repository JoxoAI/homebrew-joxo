# The Joxo command-line connector as one self-contained executable: no Node.js, nothing else to
# install. (`brew install --cask joxoai/joxo/joxo` is the menu-bar app, which carries its own copy.)
# Version and checksums are rewritten by .github/workflows/sync.yml from the connector release
# `connector-v<version>` of JoxoAI/joxo (its binary-manifest.json); edit the release, not this file.
# The executable is Node.js with the connector inside, signed with Joxo's Developer ID and notarized
# on macOS. Homebrew owns its updates: the connector's own self-update leaves a Cellar install alone.
class JoxoCli < Formula
  desc "Command-line connector for Joxo: one project for your team's AI coding agents"
  homepage "https://joxo.ai/"
  version "0.2.44"
  license :cannot_represent

  livecheck do
    url :stable
    regex(/^connector-v?(\d+(?:\.\d+)+)$/i)
    strategy :github_releases
  end

  on_macos do
    on_arm do
      url "https://github.com/JoxoAI/joxo/releases/download/connector-v#{version}/joxo-darwin-arm64.gz"
      sha256 "0000000000000000000000000000000000000000000000000000000000000000"
    end
    on_intel do
      url "https://github.com/JoxoAI/joxo/releases/download/connector-v#{version}/joxo-darwin-x64.gz"
      sha256 "0000000000000000000000000000000000000000000000000000000000000000"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/JoxoAI/joxo/releases/download/connector-v#{version}/joxo-linux-arm64.gz"
      sha256 "0000000000000000000000000000000000000000000000000000000000000000"
    end
    on_intel do
      url "https://github.com/JoxoAI/joxo/releases/download/connector-v#{version}/joxo-linux-x64.gz"
      sha256 "0000000000000000000000000000000000000000000000000000000000000000"
    end
  end

  def install
    # Homebrew gunzips the download and keeps the file's name without ".gz".
    binary = Dir["joxo-*"].first
    chmod 0555, binary
    bin.install binary => "joxo"
  end

  def caveats
    <<~EOS
      Joxo's hooks and MCP entries name #{opt_bin}/joxo, which stays put across upgrades.
      Set up a project folder with:
        joxo connect
    EOS
  end

  test do
    health = JSON.parse(shell_output("#{bin}/joxo --joxo-update-health"))
    assert_equal "joxo", health["product"]
    assert_equal version.to_s, health["version"]
    assert_match "Joxo", shell_output("#{bin}/joxo help")
  end
end
