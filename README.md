# Joxo Homebrew tap

```sh
brew install --cask joxoai/joxo/joxo
```

That installs **Joxo** for macOS (Apple Silicon and Intel), signed with Developer ID and notarized.
The app updates itself from the release feed, and puts the `joxo` command on your PATH the first
time it installs the connector, so a terminal or a coding agent can use it right away.

- Website and account: https://joxo.ai
- Releases, issues and discussions: https://github.com/JoxoAI/joxo
- Set-up instructions for a coding agent: https://joxo.ai/skill.md

This tap is maintained automatically: `.github/workflows/sync.yml` rewrites the cask's version and
checksums from the latest published release of `JoxoAI/joxo`.
