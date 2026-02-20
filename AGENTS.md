# Agent Notes

For data model standards, see:

- @.claude/commands/design-os/data-model.md

## Local Docker Dev (Preferred)

Use the scripts in `scripts/` (these wrap `docker compose -f docker/docker-compose.yml ...`):

- `./scripts/docker-dev-up.sh`
- `./scripts/docker-dev-restart.sh`
- `./scripts/docker-dev-logs.sh [service]`
- `./scripts/docker-dev-down.sh`
