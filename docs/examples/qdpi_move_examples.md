# QDPI Move Examples

This document provides concrete examples of QDPI moves, including their `logQdpiMove` tRPC input, the resulting `numericGlyph`, the decoded `Glyph` object, and a representation of the database entry in the `qdpi_moves` table.

## Example 1: Merge by MythicGuardian

**Scenario:** A MythicGuardian is merging two draft artifacts into a target page, making this a private internal structural change.

**A. `logQdpiMove` Input (JSON Payload):**
```json
{
  "action": 7,
  "context": 0,
  "state": 1,
  "role": 3,
  "relation": 0,
  "polarity": 0,
  "rotation": 0,
  "modality": 0,
  "userId": "mythic_guardian_001",
  "operationDetails": "{\"targetPageId\":\"page_abc_123\",\"sourceArtifactIds\":[\"artifact_x\",\"artifact_y\"],\"notes\":\"Consolidating draft revisions\"}"
}
```

**B. Resulting `numericGlyph`:**
- Decimal: 14512
- Hexadecimal: 0x38B0

**C. Decoded `Glyph` Object (Conceptual - using enum names for clarity):**
```typescript
{
  action: Action.Merge,
  context: Context.Page,
  state: State.Private,
  role: Role.MythicGuardian,
  relation: Relation.S2O,
  polarity: Polarity.Internal,
  rotation: Rotation.N,
  modality: Modality.Text
}
```

**D. Example `qdpi_moves` Database Row:**
(Assuming `id` is auto-incremented and `timestamp` is current time)
- `id`: 1 (example)
- `timestamp`: 1678886400000 (example Unix MS)
- `numericGlyph`: 14512
- `action`: 7
- `context`: 0
- `state`: 1
- `role`: 3
- `relation`: 0
- `polarity`: 0
- `rotation`: 0
- `modality`: 0
- `userId`: "mythic_guardian_001"
- `operationDetails`: "{\"targetPageId\":\"page_abc_123\",\"sourceArtifactIds\":[\"artifact_x\",\"artifact_y\"],\"notes\":\"Consolidating draft revisions\"}"

---

## Example 2: Dream by AICharacter

**Scenario:** An AI Character (`aichar_sylva_instance_1`) is generating content via a "dream," using a seed phrase. The dream is an internal, private audio experience.

**A. `logQdpiMove` Input (JSON Payload):**
```json
{
  "action": 9,
  "context": 3,
  "state": 1,
  "role": 1,
  "relation": 1,
  "polarity": 0,
  "rotation": 2,
  "modality": 1,
  "userId": "aichar_sylva_instance_1",
  "operationDetails": "{\"seed\":\"whispers of the old forest\",\"characterProfile\":\"elve_seer_Sylva\"}"
}
```

**B. Resulting `numericGlyph`:**
- Decimal: 52890
- Hexadecimal: 0xCF3A

**C. Decoded `Glyph` Object (Conceptual - using enum names for clarity):**
```typescript
{
  action: Action.Dream,
  context: Context.Generation,
  state: State.Private,
  role: Role.AICharacter,
  relation: Relation.O2S,
  polarity: Polarity.Internal,
  rotation: Rotation.S,
  modality: Modality.Audio
}
```

**D. Example `qdpi_moves` Database Row:**
- `id`: 2 (example)
- `timestamp`: 1678886500000 (example Unix MS)
- `numericGlyph`: 52890
- `action`: 9
- `context`: 3
- `state`: 1
- `role`: 1
- `relation`: 1
- `polarity`: 0
- `rotation`: 2
- `modality`: 1
- `userId`: "aichar_sylva_instance_1"
- `operationDetails`: "{\"seed\":\"whispers of the old forest\",\"characterProfile\":\"elve_seer_Sylva\"}"

---

## Example 3: Link by Guest

**Scenario:** A Guest user is linking from one public page to another.

**A. `logQdpiMove` Input (JSON Payload):**
```json
{
  "action": 2,
  "context": 0,
  "state": 0,
  "role": 2,
  "relation": 0,
  "polarity": 1,
  "rotation": 1,
  "modality": 0,
  "userId": "guest_session_xyz",
  "operationDetails": "{\"sourcePageId\":\"page_guest_view_456\",\"targetPageId\":\"page_info_789\",\"linkText\":\"See related info\"}"
}
```

**B. Resulting `numericGlyph`:**
- Decimal: 4133
- Hexadecimal: 0x1025

**C. Decoded `Glyph` Object (Conceptual - using enum names for clarity):**
```typescript
{
  action: Action.Link,
  context: Context.Page,
  state: State.Public,
  role: Role.Guest,
  relation: Relation.S2O,
  polarity: Polarity.External,
  rotation: Rotation.E,
  modality: Modality.Text
}
```

**D. Example `qdpi_moves` Database Row:**
- `id`: 3 (example)
- `timestamp`: 1678886600000 (example Unix MS)
- `numericGlyph`: 4133
- `action`: 2
- `context`: 0
- `state`: 0
- `role`: 2
- `relation`: 0
- `polarity`: 1
- `rotation`: 1
- `modality`: 0
- `userId`: "guest_session_xyz"
- `operationDetails`: "{\"sourcePageId\":\"page_guest_view_456\",\"targetPageId\":\"page_info_789\",\"linkText\":\"See related info\"}"
}
```
