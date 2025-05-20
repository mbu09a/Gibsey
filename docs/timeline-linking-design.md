# Timeline Linking and Merge Confirmation

This design doc outlines proposed UI/UX elements for linking timelines in the Vault and for confirming merges. It also describes how these actions influence gift tracking and overall workflow.

## Linking Timelines

### UI Elements
- **Link Timeline** button in the Vault view.
- Modal or side panel listing available timelines with title, owner, last update, and associated symbols.
- Search/filter field for quick lookup.

### Workflow
1. User clicks **Link Timeline**.
2. Selects one or more timelines from the list.
3. Pressing **Link** adds them to the current timeline's sidebar and records the event in the Vault.

### Gift Logic Impact
- Linking grants a small gift credit to the owner of the linked timeline and recognition to the linker.
- Both parties see the update in their TNA ledger.

## Confirming Merges

### UI Elements
- **Merge Pending** notification when overlapping entries exist.
- Merge review screen displaying side-by-side differences with options to keep, discard, or annotate.
- **Confirm Merge** button to finalize.

### Workflow
1. User reviews changes in the merge screen.
2. Selecting **Confirm Merge** merges entries and updates ordering.
3. The Vault stores a merge record for traceability.

### Gift Logic Impact
- Successful merges reward contributing authors with additional gift credits.
- Rejected merges do not award gifts but are logged.
- Merging may trigger notifications to MCPs or n8n workflows.

## Effect on Other Workflows
- Linked timelines become available for DreamRIA and MCP cross-reference.
- Merge confirmations kick off backend validation to maintain symbol integrity.
- The user's gift ledger updates after each linking or merging action, reinforcing the Gift Economy.

---

*Update this document as the UI evolves and new interactions emerge.*
