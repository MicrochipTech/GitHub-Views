process.env.TOKEN_ENC_KEY = `W9fYNQnPD9Xw+S/lhJlJIoIVLIlYaN9VXuOKGNpleKY=`;
process.env.TOKEN_SIG_KEY = `ET8V/w1JaNQrgRqeGzlFCoucarIrVktu1duJGnSVHlKzreSKQXLuoxEQhZYIGMdiVWfPmCZRBVeUALCgPjgPsw==`;

import sinon, {SinonSandbox} from 'sinon';
import { expect } from 'chai';
import { connect, clearDatabase, closeDatabase } from './db-handler';

import RepositoryModel from "../models/Repository";
import UserModel from "../models/User";
import TokenModel from '../models/Token';

import GitHubApiCtrl from '../controllers/GitHubApiCtrl';
import RepositoryCtrl from '../controllers/RepositoryCtrl';

import dailyUpdate from '../config/updateRepositories';
import { Response } from '../config/updateRepositories.types';
import fs from 'fs';

describe(`cron-setup`, () => {

  let sandbox: SinonSandbox;

  /* Connect to a new in-memory database before running any tests. */
  before(async () => {
    await connect();
    sandbox = sinon.createSandbox({});
  });

  /* Clear all test data after every test. */
  afterEach(async () => {
    await clearDatabase();
    sandbox.restore();
  });

  /* Remove and close the db and server. */
  after(async () => {
    await closeDatabase();
  });

  describe(`updateRepositories`, () => {
    it(`#empty`, async () => {
      /* Ensure database is mocked: no users and repositories stored */
      await UserModel.countDocuments({}, (err, count) => {
        if (err) console.log(err);
        else expect(count).to.be.equal(0);
      });
      await RepositoryModel.countDocuments({}, (err, count) => {
        if (err) console.log(err);
        else expect(count).to.be.equal(0);
      });
    });

    it(`#still empty`, async () => {
      /* When database is empty, dailyUpdate 
      should not add any data in database or crash */
      await dailyUpdate();

      await UserModel.countDocuments({}, (err, count) => {
        if (err) console.log(err);
        else expect(count).to.be.equal(0);
      });
      await RepositoryModel.countDocuments({}, (err, count) => {
        if (err) console.log(err);
        else expect(count).to.be.equal(0);
      });
    });

    it(`#one user with no local and no remote repos`, async () => {
      /* 
       - 1 user with no repository in database
       - no repositories on GitHub
      
       After the update the database should have 0 repositories. */

      const t = await new TokenModel({ value: `dummy_token` }).save();

      await new UserModel({
        username: `mock_user_test`,
        githubId: `1234567`,
        token_ref: t._id,
      }).save();

      // @ts-ignore: getUserReposAtPage should return Promise<Response>
      sandbox.stub(GitHubApiCtrl, "getUserReposAtPage").callsFake(async function(token, page) : Promise<Response> {
        return { success: true, data: [] };
      });

      await dailyUpdate();

      await UserModel.countDocuments({}, (err, count) => {
        if (err) console.log(err);
        else expect(count).to.be.equal(1);
      });
      await RepositoryModel.countDocuments({}, (err, count) => {
        if (err) console.log(err);
        else expect(count).to.be.equal(0);
      });
    });

    it(`#simple not_found`, async () => {
      /* 
       - 1 user exists with 1 repository in the database
       - the same repository does not exists anymore on GitHub
      
       After the update it should be marked with not_found: true */
      const t = await new TokenModel({ value: `dummy_token` }).save();

      const u = await new UserModel({
        username: `mock_user_test`,
        githubId: `1234567`,
        token_ref: t._id,
      }).save();

      await new RepositoryModel({
        not_found: false,
        users: [u._id],
        github_repo_id: `87654321`,
        reponame: `mock_test_repo`,
      }).save();

      // @ts-ignore: getUserReposAtPage should return Promise<Response>
      sandbox.stub(GitHubApiCtrl, "getUserReposAtPage").callsFake(async function(token, page) : Promise<Response> {
        return { success: true, data: [] };
      });

      // @ts-ignore: getRepoTraffic should return Promise<Response>
      sandbox.stub(RepositoryCtrl, "getRepoTraffic").callsFake(async function(reponame, token) : Promise<Response> {
        return { success: false, status: 404, data: 'dummy_string' };
      });

      await RepositoryModel.countDocuments(
        { not_found: false },
        (err, count) => {
          if (err) console.log(err);
          else expect(count).to.be.equal(1);
        }
      );
      
      await dailyUpdate();

      await RepositoryModel.countDocuments(
        { not_found: true },
        (err, count) => {
          if (err) console.log(err);
          else expect(count).to.be.equal(1);
        }
      );
    });

    it(`#simple rename`, async () => {
      /* 
       - 1 user exists with 1 repository, 
       - the same repository is available on GitHub but it was renamed

       After the update the change should be visible in the database 
       and the name change should also be visible in the nameHistory field. */
      const t = await new TokenModel({ value: `dummy_token` }).save();

      const u = await new UserModel({
        username: `mock_user`,
        githubId: `19477518`,
        token_ref: t._id,
      }).save();

      await new RepositoryModel({
        not_found: false,
        private: false,
        users: [u._id],
        github_repo_id: `134574268`,
        reponame: `mock_user/mock_repo`,
        views: {
          total_count: 0,
          total_uniques: 0,
          data: [],
        },
        clones: {
          total_count: 0,
          total_uniques: 0,
          data: [],
        },
        forks: {
          tree_updated: false,
          data: [],
          children: [],
        },
        referrers: [],
        contents: [],
        commits: {
          updated: false,
          data: [],
        },
      }).save();

      const getUserReposAtPageCallback = sandbox.stub(GitHubApiCtrl, "getUserReposAtPage");

      getUserReposAtPageCallback.onCall(0).returns(Promise.resolve(JSON.parse(fs.readFileSync(`./mocks/rename/getUserRepos.json`).toString())));

      getUserReposAtPageCallback.onCall(1).returns(Promise.resolve({
        success: true,
        data: []
      }));

      sandbox.stub(RepositoryCtrl, "getRepoTraffic").callsFake(function() {
        const rawdata = fs.readFileSync(
          `./mocks/rename/getRepoTraffic.json`
        );
        return JSON.parse(rawdata.toString());
      });

      const mockRepo = await RepositoryModel.findOne({
        github_repo_id: `134574268`,
      });
      expect(mockRepo.reponame).to.be.equal("mock_user/mock_repo");
      expect(mockRepo.nameHistory.length).to.be.equal(0);

      await dailyUpdate();

      const mockRepoRenamed = await RepositoryModel.findOne({
        github_repo_id: `134574268`,
      });

      expect(mockRepoRenamed.reponame).to.be.equal(
        "mock_user/mock_repo_renamed"
      );
      expect(mockRepoRenamed.nameHistory.length).to.be.equal(1);
      expect(mockRepoRenamed.nameHistory[0].change).to.be.equal(
        "mock_user/mock_repo -> mock_user/mock_repo_renamed"
      );

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const historyDate = new Date(mockRepoRenamed.nameHistory[0].date);
      historyDate.setUTCHours(0, 0, 0, 0);
      expect(today.getTime()).to.be.equal(historyDate.getTime());
    });

    it(`#simple no duplicates`, async () => {
      /* 
        - 2 users with no repos in database
        - Both users have access on GitHub to the same repository

        After update, one single repository should be added,
        with both users id in the users field. */
      const t1 = await new TokenModel({ value: `dummy_token1` }).save();
      const t2 = await new TokenModel({ value: `dummy_token2` }).save();

      const u1 = await new UserModel({
        username: `mock_user1`,
        githubId: `19477518`,
        token_ref: t1._id,
      }).save();

      const u2 = await new UserModel({
        username: `mock_user2`,
        githubId: `19477519`,
        token_ref: t2._id,
      }).save();

      const getUserReposAtPageCallback = sandbox.stub(GitHubApiCtrl, "getUserReposAtPage");

      getUserReposAtPageCallback.onCall(0).returns(Promise.resolve(JSON.parse(fs.readFileSync(`./mocks/no_duplicates/getUserRepos.json`).toString())));

      getUserReposAtPageCallback.onCall(1).returns(Promise.resolve({
        success: true,
        data: []
      }));

      getUserReposAtPageCallback.onCall(2).returns(Promise.resolve(JSON.parse(fs.readFileSync(`./mocks/no_duplicates/getUserRepos.json`).toString())));

      getUserReposAtPageCallback.onCall(3).returns(Promise.resolve({
        success: true,
        data: []
      }));

      sandbox.stub(RepositoryCtrl, "getRepoTraffic").callsFake(function() {
        const rawdata = fs.readFileSync(
          `./mocks/no_duplicates/getRepoTraffic.json`
        );
        return JSON.parse(rawdata.toString());
      });

      await dailyUpdate();

      await UserModel.countDocuments({}, (err, count) => {
        if (err) console.log(err);
        else expect(count).to.be.equal(2);
      });

      const repos = await RepositoryModel.find({});
      expect(repos.length).to.be.equal(1);
      const mockRepo = repos[0];
      expect(mockRepo.users.length).to.be.equal(2);

      expect(
        mockRepo.users
          .map((u) => String(u))
          .find((u: String) => u === String(u1._id)) !== undefined
      ).to.be.equal(true);
      expect(
        mockRepo.users
          .map((u) => String(u))
          .find((u: String) => u === String(u2._id)) !== undefined
      ).to.be.equal(true);
    });

    it(`#simple create`, async () => {
      /* 
       - 1 user with no repos in database
       - 1 repository on GitHub

       After update it should appear in database with all repository
       traffic: views, clones, forks, contents, referrers, etc. */
      const t = await new TokenModel({ value: `dummy_token` }).save();

      const u = await new UserModel({
        username: `mock_user`,
        githubId: `19477518`,
        token_ref: t._id,
      }).save();

      const getUserReposAtPageCallback = sandbox.stub(GitHubApiCtrl, "getUserReposAtPage");
      getUserReposAtPageCallback.onCall(0).returns(Promise.resolve(JSON.parse(fs.readFileSync(`./mocks/create/getUserRepos.json`).toString())));
      getUserReposAtPageCallback.onCall(1).returns(Promise.resolve({
        success: true,
        data: []
      }));

      sandbox.stub(RepositoryCtrl, "getRepoTraffic").callsFake(function() {
        const rawdata = fs.readFileSync(
          `./mocks/create/getRepoTraffic.json`
        );
        return JSON.parse(rawdata.toString());
      });

      await dailyUpdate();

      const repos = await RepositoryModel.find({});
      expect(repos.length).to.be.equal(1);

      const mockRepo = repos[0];
      expect(mockRepo.not_found).to.be.equal(false);
      expect(mockRepo.users.length).to.be.equal(1);
      expect(mockRepo.users[0]).to.deep.equal(u._id);
      expect(mockRepo.github_repo_id).to.be.equal(`134574268`);
      expect(mockRepo.reponame).to.be.equal(`mock_user/mock_repo`);
      expect(mockRepo.views.data.length).to.be.equal(15);
      expect(mockRepo.clones.data.length).to.be.equal(1);
      expect(mockRepo.forks.tree_updated).to.be.equal(false);
      expect(mockRepo.forks.children.length).to.be.equal(0);
      expect(mockRepo.forks.data.length).to.be.equal(1);
      expect(mockRepo.referrers.length).to.be.equal(7);
      expect(mockRepo.contents.length).to.be.equal(10);
      expect(mockRepo.nameHistory.length).to.be.equal(0);
      expect(mockRepo.commits.updated).to.be.equal(false);
      expect(mockRepo.commits.data.length).to.be.equal(0);
    });
  });
});
