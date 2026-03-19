export interface RepoState {
  branch: string;
  headShort: string;
  mergeBaseHash: string;
  commitsAhead: number;
  commitsBehind: number;
  isDirty: boolean;
  dirtyCount: number;
  stashCount: number;
  isDetached: boolean;
}

export interface ReflogEntry {
  hash: string;
  fromBranch: string;
  toBranch: string;
  timestamp: string;
}
