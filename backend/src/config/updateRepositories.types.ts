import { Log, Referrer, Content, Repository } from "../models/Repository";

export type RemoteRepository = any;
export type RepoSyncFunction = (repo: RemoteRepository) => Promise<void>;

export interface Response {
  success: boolean,
  status?: any,
  data?: any
}

export interface AggRepoForkSum extends Omit<Repository, "views" | "clones" | "referrers" | "contents" | "forks"> {
  forks_sum: number,
}

export interface AggRepoReducedTraffic extends Omit<Repository, "views" | "clones" | "referrers" | "contents" | "forks">{
  referrers: Omit<Referrer, "data">,
  contents: Omit<Content, "title" | "data">,
  views_length: number,
  last_view: Log,
  clones_length: number,
  last_clone: Log,
}
