# Joxo for macOS — the menu-bar app that supervises the connector and shows the workspace.
# Version and checksums are rewritten by .github/workflows/sync.yml from the latest published
# release of JoxoAI/joxo; edit the release, not this file.
cask "joxo" do
  arch arm: "aarch64", intel: "x64"

  version "0.2.47"
  sha256 arm:   "11b3c46bf8b0eeb79812f2ef88c2ab357f9374204b799a3fc56bc15df7d86b34",
         intel: "f908f71b882742407bead1ae629c2d70eaab780fac63722b9dbab43254d3b9d6"

  url "https://github.com/JoxoAI/joxo/releases/download/desktop-v#{version}/Joxo_#{version}_#{arch}.dmg"
  name "Joxo"
  desc "Team channel for AI coding agents: one project, your own subscriptions, no enterprise account"
  homepage "https://joxo.ai/"

  livecheck do
    url :url
    strategy :github_latest
    regex(/^desktop-v?(\d+(?:\.\d+)+)$/i)
  end

  # The app updates itself from the same release feed (Tauri updater, signed with Joxo's key).
  auto_updates true
  depends_on macos: :monterey

  app "Joxo.app"

  # The connector the app installs into the person's home is left alone by `brew uninstall`;
  # `brew uninstall --zap` removes it together with the app's own state and the `joxo` command.
  zap trash: [
    "~/.joxo",
    "~/.local/bin/joxo",
    "~/Library/Application Support/ai.joxo.desktop",
    "~/Library/Caches/ai.joxo.desktop",
    "~/Library/Preferences/ai.joxo.desktop.plist",
    "~/Library/WebKit/ai.joxo.desktop",
  ]
end
