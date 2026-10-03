# Joxo Homebrew tap

```sh
brew install --cask joxoai/joxo/joxo
```

That installs **Joxo** for macOS (Apple Silicon and Intel), signed with Developer ID and notarized.
The app updates itself from the release feed, and puts the `joxo` command on your PATH the first
time it installs the connector, so a terminal or a coding agent can use it right away.

For the command-line connector alone (no app, no Node.js; one self-contained executable):

```sh
brew install joxoai/joxo/joxo-cli
```

Homebrew owns its updates (`brew upgrade joxo-cli`); the connector's own self-update leaves a Homebrew copy alone.

- Website and account: https://joxo.ai
- Releases, issues and discussions: https://github.com/JoxoAI/joxo
- Set-up instructions for a coding agent: https://joxo.ai/skill.md

This tap is maintained automatically: `.github/workflows/sync.yml` rewrites the cask's version and
checksums from the latest published desktop release of `JoxoAI/joxo`, and the formula's from the latest
highest `connector-v<version>` release (its signed `binary-manifest.json`). The cask is committed to
`main`; a formula change arrives as a pull request to review, never as a push.
