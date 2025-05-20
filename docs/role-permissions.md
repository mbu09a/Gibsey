# Role Permissions & Example Vault Events

This document captures the basic capabilities granted to each user role in the Gibsey platform and provides sample JSON snippets for Vault logging. These serve as reference for documentation and future unit tests.

---

## Role Permissions Table

| Role            | Allowed Actions                                                |
| --------------- | -------------------------------------------------------------- |
| **Guest**       | Read pages, browse symbols, react with emojis                  |
| **Scribe**      | All Guest actions plus comment on pages and create drafts      |
| **Contributor** | All Scribe actions plus open pull requests and manage branches |
| **Guardian**    | Full Contributor rights plus approve merges and manage roles   |

These permissions are intentionally lightweight. More granular capabilities can be layered in the API as the project evolves.

---

## Example Vault Log Snippets

### Guest Reaction Example

```json
{
  "action": "React",
  "role": "Guest"
}
```

### Mythic Guardian Merge Approval Example

```json
{
  "action": "Save",
  "role": "MythicGuardian",
  "approval": true
}
```

*These snippets will be referenced by unit tests when Vault logging is implemented.*

---

