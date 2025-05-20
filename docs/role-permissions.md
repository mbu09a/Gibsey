# Role Permissions Examples

This short document captures sample events for the Vault logging system. Once Vault logging is implemented, these examples can be referenced in test comments.

## Guest reaction example

```json
{
  "action": "React",
  "role": "Guest"
}
```

## Mythic Guardian merge approval example

```json
{
  "action": "Save",
  "role": "MythicGuardian",
  "approval": true
}
```

These snippets will be referenced by unit tests when Vault logging is built.
