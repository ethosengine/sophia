# Sophia - Assessment Engine (pnpm workspace)
#
# Forked from Khan Academy Perseus. Renders assessments in mastery,
# discovery, and reflection modes.

set dotenv-load := false

# List available recipes
default:
    @just --list

# Install dependencies
install:
    pnpm install

# Build all packages
build:
    pnpm build

# Build UMD bundle for Angular integration
build-umd:
    pnpm build:umd

# Run tests
test:
    pnpm test --ci

# Lint
lint:
    pnpm lint

# Type-check
typecheck:
    pnpm typecheck

# Quality gate: lint + typecheck + test
gate: lint typecheck test
