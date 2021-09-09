// const mongoose = require("mongoose");
import { ForkOptions } from 'child_process';
import { Document, Schema, model, PopulatedDoc } from 'mongoose';
import { User } from './User';

export interface Fork extends Document {
  github_repo_id: String,
  reponame: String,
  count: Number,
  children: Fork[],
}

const forkSchema = new Schema();
forkSchema.add({
  github_repo_id: String,
  reponame: String,
  count: Number,
  children: [forkSchema],
});



export interface Log {
  timestamp: Date,
  count: number,
  uniques: number,
}

export interface Views {
  total_count: number,
  total_uniques: number,
  data: Log[],
}

export type Clones = Views;

export interface Forks {
  tree_updated: boolean,
  children: Fork[],
  data: Omit<Log, "uniques">[],
}

export interface Referrer {
  name: string,
  data: Log[],
}

export interface Content {
  path: string,
  title: string,
  data: Log[],
}

export interface nameLog {
  date: Date,
  change: string,
}

export interface Commit {
  sha: string,
  message: string,
  timestamp: Date,
}

// type User = any; // TODO

export interface Repository extends Document{
  not_found: boolean,
  users: PopulatedDoc<User>[],
  github_repo_id: string,
  reponame: string,
  private: boolean,
  views: Views,
  clones: Clones,
  forks: Forks,
  referrers: Referrer[],
  contents: Content[],
  nameHistory: nameLog[],
  commits: {
    updated: Boolean,
    data: Commit[],
  },
}

const repositorySchema = new Schema({
  not_found: Boolean,
  users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  github_repo_id: String,
  reponame: {
    type:String,
    unique: true, // this is important!! (it creates an index in the db)
  },
  private: Boolean,
  views: {
    total_count: Number,
    total_uniques: Number,
    data: [
      {
        timestamp: Date,
        count: Number,
        uniques: Number,
      },
    ],
  },
  clones: {
    total_count: Number,
    total_uniques: Number,
    data: [
      {
        timestamp: Date,
        count: Number,
        uniques: Number,
      },
    ],
  },
  forks: {
    tree_updated: Boolean,
    children: [forkSchema],
    data: [
      {
        timestamp: Date,
        count: Number,
      },
    ],
  },
  referrers: [
    {
      name: String,
      data: [
        {
          timestamp: Date,
          count: Number,
          uniques: Number,
        },
      ],
    },
  ],
  contents: [
    {
      path: String,
      title: String,
      data: [
        {
          timestamp: Date,
          count: Number,
          uniques: Number,
        },
      ],
    },
  ],
  nameHistory: [
    {
      date: Date,
      change: String,
    },
  ],
  commits: {
    updated: Boolean,
    data: [
      {
        sha: String,
        message: String,
        timestamp: Date,
      },
    ],
  },
});

export default model<Repository>("Repository", repositorySchema);
