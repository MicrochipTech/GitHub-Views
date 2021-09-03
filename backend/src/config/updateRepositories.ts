import { Schema, QueryCursor, AggregationCursor } from 'mongoose';
import { getUserRepos, getUserReposAtPage } from "../controllers/GitHubApiCtrl";
import { createRepository, getRepoTraffic, updateRepoTraffic } from "../controllers/RepositoryCtrl";
import RepositoryModel, { Log, Referrer, Content, Repository } from "../models/Repository";
import UserModel, { User } from "../models/User";
import { logger, errorHandler } from "../logs/logger";
import to from 'await-to-js';
import { Token } from '../models/Token';

type RemoteRepository = any;
type RepoSyncFunction = (repo: RemoteRepository) => Promise<void>;

interface Response {
  success: boolean,
  status?: any,
  data?: any
}

async function forEachGitHubRepo(token: Token, fn: RepoSyncFunction): Promise<void> { //check return type
  let page: number = 1;

  while(true) {
    const res: Response = await getUserReposAtPage(token.value, page);

    if (res === undefined || res.success == false || res.data.length === 0) { // verify condition / data undefined?
      return;
    }
    
    await Promise.all(res.data.map(async (remoteRepo: RemoteRepository) => {
      await fn(remoteRepo);
    }));

    page += 1;
  }
}

export async function syncWithGitHub(user: User): Promise<void> {
  console.log(`Syncing repos for user ${user.username}...`);
  
  const token: Token = user.token_ref;

  await forEachGitHubRepo(token, async (remoteRepo: RemoteRepository) => {

    interface MinimalRepository extends Omit<Repository, "views" |
                                                          "clones" | 
                                                          "referrers" | 
                                                          "contents" | 
                                                          "forks"> {
      forks_sum: number,
    }

    const localReposResult: MinimalRepository[] = await RepositoryModel.aggregate([
      {
        $match: { github_repo_id : String(remoteRepo.id) },
      },
      {
        $project: {
          users: 1,
          github_repo_id: 1,
          private: 1,
          reponame: 1,
          forks_sum: { $sum: "$forks.data.count" },
        },
      },
    ]);

    if(localReposResult.length > 1) {
      // TODO is it possible? 
    }

    if(localReposResult.length === 0) {
      const newRepoRes: Response = await createRepository(
        remoteRepo,
        user._id,
        token.value
      );

      if(newRepoRes.success == false) {
        // TODO error
      }

      
      console.log(`Repo ${remoteRepo.full_name} not found in local database. Creating...`);
      const newRepo: Repository = newRepoRes.data;
      await newRepo.save();
    }

    if(localReposResult.length === 1) {
      const localRepo: MinimalRepository = localReposResult[0];
      
      const userExists = localRepo.users.map((u) => String(u)).find((u: String) => u === String(user._id));
      if(userExists === undefined) {
        await RepositoryModel.updateOne(
          { _id: localRepo._id },
          {
            $push: {
              users: user._id
            },
          }
        ).exec();
      }

      if (localRepo.reponame !== remoteRepo.full_name) {
        console.log(`Name change: ${localRepo.reponame} -> ${remoteRepo.full_name}`);
        await RepositoryModel.updateOne(
          { _id: localRepo._id },
          {
            reponame: remoteRepo.full_name,
            $push: {
              nameHistory: {
                date: new Date(),
                change: `${localRepo.reponame} -> ${remoteRepo.full_name}`,
              },
            },
          }
        ).exec();
      }

      if (localRepo.private !== remoteRepo.private) {
        console.log(`Repo ${remoteRepo.full_name} is now ${remoteRepo.private ? `private` : `public`}...`);
        await RepositoryModel.updateOne(
          { _id: localRepo._id },
          {
            private: remoteRepo.private
          }
        ).exec();
      }

      if (localRepo.forks_sum !== remoteRepo.forks_count) {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        console.log(`Repo ${remoteRepo.full_name} forks updated...`);
        await RepositoryModel.updateOne(
          { _id: localRepo._id },
          {
            $push: {
              "forks.data": {
                timestamp: today.toISOString(),
                count: remoteRepo.forks_count - localRepo.forks_sum,
              },
            },
          }
        ).exec();
      }

      await RepositoryModel.updateOne(
        { _id: localRepo._id },
        {
          "forks.tree_updated": false, //todo
          "commits.updated": false, // this will be set daily
        }
      ).exec();
    }
  }); 
}

export async function updateTraffic(user: User): Promise<void> {
  console.log(`Updating traffic for user ${user.username}...`);

  const token: Token = user.token_ref;

  interface MinimalRepository extends Omit<Repository, "views" | "clones" | "referrers" | "contents" | "forks">{
    referrers: Omit<Referrer, "data">,
    contents: Omit<Content, "title" | "data">,
    views_length: number,
    last_view: Log,
    clones_length: number,
    last_clone: Log,
  }

  const reposCursor: AggregationCursor = RepositoryModel.aggregate([
    {
      $match: { users: user._id }, // TODO check if it works
    },
    {
      $project: {
        github_repo_id: 1,
        reponame: 1,
        "referrers.name": 1,
        "contents.path": 1,
        views_length: { $size: "$views.data" },
        last_view: { $arrayElemAt: ["$views.data", -1] },
        clones_length: { $size: "$clones.data" },
        last_clone: { $arrayElemAt: ["$clones.data", -1] }, 
      },
    },
  ]).cursor({batchSize:1}).exec();

  await reposCursor.eachAsync(async (localRepo : MinimalRepository) => {
    /* Update traffic (views, clones, referrers, contents) */
    const { success, status, data: traffic } = await getRepoTraffic(localRepo.reponame, token.value);

    if(status == 404) {
      console.log(`Repo ${localRepo.reponame} not found...`);
      await RepositoryModel.updateOne(
        { _id: localRepo._id },
        {
          not_found: true,
        }
      ).exec();
    }

    if(!success) return;

    try {
      await updateRepoTraffic(localRepo, traffic);
    } catch (err) {
      console.log(err);
    }
  });

  await reposCursor.close();
}

export default async function dailyUpdate() {
  const usersCursor: QueryCursor<User> = UserModel.find({
    githubId: { $ne: null },
    token_ref: { $exists: true },
  }).populate("token_ref").cursor({batchSize:1});

  await usersCursor.eachAsync(async (user: User) => {
    await syncWithGitHub(user);
    await updateTraffic(user);
    console.log(`User ${user.username} update complete.`);
  });

  await usersCursor.close();
}
