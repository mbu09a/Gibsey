export interface VaultEntry {
  id: number;
  action: string;
  context: string;
  state: string;
  role: string;
  relation: string;
  polarity: string;
  rotation: string;
  content: string;
  actorId: string;
  createdAt: number;
}