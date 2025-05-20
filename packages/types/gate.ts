export type QDPIAction = 'Read' | 'Index' | 'Prompt' | 'React' | 'Write' | 'Save' | 'Forget' | 'Dream';
export type QDPIContext = 'Page' | 'Prompt/Query' | 'Reaction/Draft' | 'Generation';
export type QDPIState = 'Public' | 'Private' | 'Sacrifice' | 'Gift';
export type QDPIRole = 'Human' | 'AI' | 'System' | 'Part';
export type QDPIRelation = 'SubjectToObject' | 'ObjectToSubject';
export type QDPIPolarity = 'Internal' | 'External';
export type QDPIOrientation = 'N' | 'E' | 'S' | 'W';

export interface GateMessage {
  id: string;
  action: QDPIAction;
  context: QDPIContext;
  state: QDPIState;
  role: QDPIRole;
  relation: QDPIRelation;
  polarity: QDPIPolarity;
  orientation: QDPIOrientation;
  fromWorld: string;
  toWorld: string;
  payload: unknown;
}
