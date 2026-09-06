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

# Run tests. Jest defaults to (cores - 1) workers — 23 on the 24-core dev box, ~13.5 GB
# resident, which the workspace RAM guard sheds at its 80–90% line whenever the local
# mesh is up (elohim pre-push #13, 2026-09-06). Cap the workers; JEST_WORKERS overrides.
test:
    pnpm test --ci --maxWorkers={{env('JEST_WORKERS', '4')}}

# Lint
lint:
    pnpm lint

# Type-check
typecheck:
    pnpm typecheck

# Quality gate: lint + typecheck + test
gate: lint typecheck test
