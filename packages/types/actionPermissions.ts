import { Action } from '../utils/glyphCodec'; // Path should be correct

// Maps QDPI Action enum string names to required capability strings
// These capability strings must exist in `packages/types/roles.ts#roleCapabilities`
export const qdpiActionCapabilities: Partial<Record<keyof typeof Action, string>> = {
  Read: 'read',
  Index: 'read',    // Defaulting to 'read', can be made stricter later if needed
  Link: 'comment',
  Prompt: 'react',
  React: 'react',
  Write: 'draft',
  Save: 'draft',    // Assuming user-driven save maps to 'draft'
  Merge: 'approve', // Requires 'approve' capability (MythicGuardian, WholeSystem)
  Forget: 'moderate',// Requires 'moderate' capability (MythicGuardian)
  Dream: 'react',
};
