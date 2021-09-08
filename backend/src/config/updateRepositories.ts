import { QueryCursor, AggregationCursor } from 'mongoose';
import { getUserReposAtPage } from "../controllers/GitHubApiCtrl";
import { createRepository, getRepoTraffic, updateRepoTraffic } from "../controllers/RepositoryCtrl";
import RepositoryModel, { Repository } from "../models/Repository";
import UserModel, { User } from "../models/User";
import { Token } from '../models/Token';
import { RemoteRepository, RepoSyncFunction, Response, AggRepoForkSum, AggRepoReducedTraffic, UpdateObject } from "../config/updateRepositories.types";
import { logger } from "../logs/logger";

async function forEachGitHubRepo(token: Token, fn: RepoSyncFunction): Promise<void> {
  let page: number = 1;

  while(true) {
    const res: Response = await getUserReposAtPage(token.value, page);

    if (res === undefined || res.success == false || res.data.length === 0) {
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

    const localReposResult: AggRepoForkSum[] = await RepositoryModel.aggregate([
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
      logger.error(`Duplicate repositories found for repository with github id: ${remoteRepo.id}.`);
      return;
    }

    if(localReposResult.length === 0) {
      const newRepoRes: Response = await createRepository(
        remoteRepo,
        user._id,
        token.value
      );

      if(newRepoRes.success == false) {
        logger.error(`Error creating repository ${remoteRepo.full_name}.`);
        return;
      }

      
      console.log(`Repo ${remoteRepo.full_name} not found in local database; creating...`);
      const newRepo: Repository = newRepoRes.data;
      await newRepo.save();
    }

    if(localReposResult.length === 1) {

      const updates: UpdateObject = {
        "forks.tree_updated": false,
        "commits.updated": false,
        $push: {}
      };

      const localRepo: AggRepoForkSum = localReposResult[0];
      
      const userExists = localRepo.users.map((u) => String(u)).find((u: String) => u === String(user._id));
      if(userExists === undefined) {
        console.log(`Adding user ${user.username} to repository ${localRepo.github_repo_id}...`);
        
        updates.$push.users = user._id;
      }

      if (localRepo.reponame !== remoteRepo.full_name) {
        console.log(`Changing name from ${localRepo.reponame} to ${remoteRepo.full_name}...`);
        
        updates.reponame = remoteRepo.full_name;
        updates.$push.nameHistory = {
          date: new Date(),
          change: `${localRepo.reponame} -> ${remoteRepo.full_name}`,
        };
      }

      if (localRepo.private !== remoteRepo.private) {
        console.log(`Changing repo ${remoteRepo.full_name} visibility to ${remoteRepo.private ? `private` : `public`}...`);

        updates.private = remoteRepo.private;
      }

      if (localRepo.forks_sum !== remoteRepo.forks_count) {
        console.log(`Updating repo ${remoteRepo.full_name} forks...`);

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        updates.$push["forks.data"] = {
          timestamp: today.toISOString(),
          count: remoteRepo.forks_count - localRepo.forks_sum,
        };
      }

      await RepositoryModel.updateOne({ _id: localRepo._id }, updates).exec();
    }
  }); 
}

export async function updateTraffic(user: User): Promise<void> {
  console.log(`Updating traffic for user ${user.username}...`);

  const token: Token = user.token_ref;

  const reposCursor: AggregationCursor = RepositoryModel.aggregate([
    {
      $match: { users: user._id },
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

  await reposCursor.eachAsync(async (localRepo : AggRepoReducedTraffic) => {
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
