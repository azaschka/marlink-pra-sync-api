# Documentation of pra-sync-api

Repository-level documentation. Platform-wide knowledge (flows across repositories, decisions, operations, investigations) is in the workspace knowledge base, starting at [../../docs/knowledge/index.md](../../docs/knowledge/index.md). Agent rules: [../AGENTS.md](../AGENTS.md).

| Document | Content |
|---|---|
| [adding-a-domain-endpoint.md](adding-a-domain-endpoint.md) | Procedure and checklists for a new endpoint or domain module |
| [naming-convention-guideline.md](naming-convention-guideline.md) | DTO, command and query naming |
| [beyondtrust-openapi.yaml](beyondtrust-openapi.yaml) | BeyondTrust configuration API contract |
| [system-overview.drawio](system-overview.drawio), [diagrams.drawio](diagrams.drawio) | Architecture diagrams |

## Environment setup

| Name    | Version |
| ------- | ------- |
| Node.js | 24.22.1 (Docker base image `node:24.22.1-alpine3.24`, pinned in `Dockerfile`) |
| NPM     | bundled with Node.js 24.22.1 |

Raise the Node.js release together with pra-api; see [environments and delivery](../../docs/knowledge/operations/environments-and-delivery.md).
