export interface VaultEntry {
  id: number;
  actorId: string;
  state: string;
  content: string;
  createdAt: number;
}

export interface LogDreamParams {
  actorId: string;
  state: string;
  content: string;
}

export interface ReplayDreamsParams {
  actorId?: string;
  start?: number;
  end?: number;
  state?: string;
}
