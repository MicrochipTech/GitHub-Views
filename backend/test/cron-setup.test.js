const sinon = require("sinon");
const nock = require("nock");
const { expect } = require("chai");
const dbHandler = require("./db-handler");
const UserModel = require("../models/User");
const RepositoryModel = require("../models/Repository");
const GitHubApiCtrl = require("../controllers/GitHubApiCtrl");
const RepositoryCtrl = require("../controllers/RepositoryCtrl");

const { updateAllRepositories } = require("../config/cron-setup");
const fs = require("fs");

process.env.TOKEN_ENC_KEY = `W9fYNQnPD9Xw+S/lhJlJIoIVLIlYaN9VXuOKGNpleKY=`;
process.env.TOKEN_SIG_KEY = `ET8V/w1JaNQrgRqeGzlFCoucarIrVktu1duJGnSVHlKzreSKQXLuoxEQhZYIGMdiVWfPmCZRBVeUALCgPjgPsw==`;
const TokenModel = require("../models/Token");

/* Connect to a new in-memory database before running any tests. */
before(async () => await dbHandler.connect());

/* Clear all test data after every test. */
afterEach(async () => await dbHandler.clearDatabase());

/* Remove and close the db and server. */
after(async () => await dbHandler.closeDatabase());

describe(`cron-setup`, () => {
  describe(`updateAllRepositories`, () => {
    it(`#empty`, async () => {
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
      await updateAllRepositories();
      await UserModel.countDocuments({}, (err, count) => {
        if (err) console.log(err);
        else expect(count).to.be.equal(0);
      });
      await RepositoryModel.countDocuments({}, (err, count) => {
        if (err) console.log(err);
        else expect(count).to.be.equal(0);
      });
    });

    it(`#one user with no local and remote repos`, async () => {
      /* Adding one user in the database */

      const t = await new TokenModel({ value: `dummy_token` }).save();

      await new UserModel({
        username: `mock_user_test`,
        githubId: `1234567`,
        token_ref: t._id,
      }).save();

      sinon.stub(GitHubApiCtrl, "getUserRepos").callsFake(function() {
        return { success: true, data: [] };
      });

      await updateAllRepositories();

      await UserModel.countDocuments({}, (err, count) => {
        if (err) console.log(err);
        else expect(count).to.be.equal(1);
      });
      await RepositoryModel.countDocuments({}, (err, count) => {
        if (err) console.log(err);
        else expect(count).to.be.equal(0);
      });

      GitHubApiCtrl.getUserRepos.restore();
    });

    it(`#simple not_found`, async () => {
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

      sinon.stub(GitHubApiCtrl, "getUserRepos").callsFake(function() {
        return { success: true, data: [] };
      });

      await RepositoryModel.countDocuments(
        { not_found: false },
        (err, count) => {
          if (err) console.log(err);
          else expect(count).to.be.equal(1);
        }
      );

      await updateAllRepositories();

      await RepositoryModel.countDocuments(
        { not_found: true },
        (err, count) => {
          if (err) console.log(err);
          else expect(count).to.be.equal(1);
        }
      );

      GitHubApiCtrl.getUserRepos.restore();
    });

    it(`#simple rename`, async () => {
      const t = await new TokenModel({ value: `dummy_token` }).save();

      const u = await new UserModel({
        username: `mock_user`,
        githubId: `19477518`,
        token_ref: t._id,
      }).save();

      await new RepositoryModel({
        not_found: false,
        users: [u._id],
        github_repo_id: `134574268`,
        reponame: `mock_user/mock_repo`,
        views: [],
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

      sinon.stub(GitHubApiCtrl, "getUserRepos").callsFake(function() {
        const rawdata = fs.readFileSync(
          `./test/mocks/rename/getUserRepos.json`
        );
        return JSON.parse(rawdata);
      });

      sinon.stub(RepositoryCtrl, "getRepoTraffic").callsFake(function() {
        const rawdata = fs.readFileSync(
          `./test/mocks/rename/getRepoTraffic.json`
        );
        return JSON.parse(rawdata);
      });

      const mockRepo = await RepositoryModel.findOne({
        github_repo_id: `134574268`,
      });
      expect(mockRepo.reponame).to.be.equal("mock_user/mock_repo");
      expect(mockRepo.nameHistory.length).to.be.equal(0);

      await updateAllRepositories();

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

      GitHubApiCtrl.getUserRepos.restore();
      RepositoryCtrl.getRepoTraffic.restore();
    });

    it(`#simple no duplicates`, async () => {
      const t1 = await new TokenModel({ value: `dummy_token1` }).save();
      const t2 = await new TokenModel({ value: `dummy_token2` }).save();

      await new UserModel({
        username: `mock_user1`,
        githubId: `19477518`,
        token_ref: t1._id,
      }).save();

      await new UserModel({
        username: `mock_user2`,
        githubId: `19477519`,
        token_ref: t2._id,
      }).save();

      sinon.stub(GitHubApiCtrl, "getUserRepos").callsFake(function() {
        const rawdata = fs.readFileSync(
          `./test/mocks/no_duplicates/getUserRepos.json`
        );
        return JSON.parse(rawdata);
      });

      sinon.stub(RepositoryCtrl, "getRepoTraffic").callsFake(function() {
        const rawdata = fs.readFileSync(
          `./test/mocks/no_duplicates/getRepoTraffic.json`
        );
        return JSON.parse(rawdata);
      });

      await updateAllRepositories();

      await UserModel.countDocuments({}, (err, count) => {
        if (err) console.log(err);
        else expect(count).to.be.equal(2);
      });

      repos = await RepositoryModel.find({});
      expect(repos.length).to.be.equal(1);
      expect(repos[0].users.length).to.be.equal(2);

      GitHubApiCtrl.getUserRepos.restore();
      RepositoryCtrl.getRepoTraffic.restore();
    });
  });
});
