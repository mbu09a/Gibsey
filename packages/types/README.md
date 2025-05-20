Common TypeScript types and interfaces shared across the Gibsey project.

### Entrance Way

`entrance-way.ts` defines the core data transfer objects (DTOs) used by the Entrance Way API.

- `Section` – basic info about a section of the text.
- `Page` – one page within a section with its text and indexes.
- `GetPageByIdParams`, `GetPagesBySectionParams`, `SearchPagesParams` – input shapes for the API procedures.
- `GetPageByIdResult`, `GetPagesBySectionResult`, `SearchPagesResult` – return types from the API.


### Vault Entries

`vault.ts` defines the `VaultEntry` interface representing a logged dream or other QDPI event stored in the database.
