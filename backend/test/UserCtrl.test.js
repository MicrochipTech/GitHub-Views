process.env.TOKEN_ENC_KEY = `W9fYNQnPD9Xw+S/lhJlJIoIVLIlYaN9VXuOKGNpleKY=`;
process.env.TOKEN_SIG_KEY = `ET8V/w1JaNQrgRqeGzlFCoucarIrVktu1duJGnSVHlKzreSKQXLuoxEQhZYIGMdiVWfPmCZRBVeUALCgPjgPsw==`;
const TokenModel = require("../models/Token");
const UserModel = require("../models/User");
const RepositoryModel = require("../models/Repository");

const UserCtrl = require("../controllers/UserCtrl");

const { expect } = require("chai");
const dbHandler = require("./db-handler");

async function createMockRepo1(user) {
  let startTimestamp = new Date();
  startTimestamp.setUTCHours(0, 0, 0, 0);
  startTimestamp.setUTCDate(startTimestamp.getUTCDate() - 40);

  let today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const timeIndex = startTimestamp;
  const mockTraffic = [];

  while (timeIndex.getTime() < today.getTime()) {
    mockTraffic.push({ timestamp: timeIndex.toISOString() });

    timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
  }

  await new RepositoryModel({
    not_found: false,
    users: [user._id],
    github_repo_id: `134574268`,
    reponame: `mock_user/mock_repo1`,
    views: {
      total_count: 0,
      total_uniques: 0,
      data: mockTraffic.map((t) => {
        return { timestamp: t.timestamp, count: 2, uniques: 1 };
      }),
    },
    clones: {
      total_count: 0,
      total_uniques: 0,
      data: mockTraffic.map((t) => {
        return { timestamp: t.timestamp, count: 4, uniques: 3 };
      }),
    },
    forks: {
      tree_updated: false,
      data: mockTraffic.map((t) => {
        return { timestamp: t.timestamp, count: 5 };
      }),
      children: [],
    },
    referrers: [],
    contents: [],
    commits: {
      updated: false,
      data: [],
    },
  }).save();
}

async function createMockRepo2(user) {
  let startTimestamp = new Date();
  startTimestamp.setUTCHours(0, 0, 0, 0);
  startTimestamp.setUTCDate(startTimestamp.getUTCDate() - 40);

  let today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let index = 0;
  const timeIndex = startTimestamp;

  const mockTraffic = [];

  while (timeIndex.getTime() < today.getTime()) {
    mockTraffic.push({ timestamp: timeIndex.toISOString() });

    timeIndex.setUTCDate(timeIndex.getUTCDate() + 2);
  }

  let timeIndex1 = new Date();
  timeIndex1.setUTCHours(0, 0, 0, 0);
  timeIndex1.setUTCDate(timeIndex1.getUTCDate() - 40);

  let timeIndex2 = new Date();
  timeIndex2.setUTCHours(0, 0, 0, 0);
  timeIndex2.setUTCDate(timeIndex2.getUTCDate() - 17);

  let timeIndex3 = new Date();
  timeIndex3.setUTCHours(0, 0, 0, 0);
  timeIndex3.setUTCDate(timeIndex3.getUTCDate() - 16);

  await new RepositoryModel({
    not_found: false,
    users: [user._id],
    github_repo_id: `134574269`,
    reponame: `mock_user/mock_repo2`,
    views: {
      total_count: 0,
      total_uniques: 0,
      data: mockTraffic.map((t) => {
        return { timestamp: t.timestamp, count: 2, uniques: 1 };
      }),
    },
    clones: {
      total_count: 0,
      total_uniques: 0,
      data: [
        {
          timestamp: timeIndex1.toISOString(),
          count: 7,
          uniques: 1,
        },
        {
          timestamp: timeIndex2.toISOString(),
          count: 1,
          uniques: 1,
        },
        {
          timestamp: timeIndex3.toISOString(),
          count: 3,
          uniques: 2,
        },
      ],
    },
    forks: {
      tree_updated: false,
      data: [
        {
          timestamp: timeIndex1.toISOString(),
          count: 7,
        },
        {
          timestamp: timeIndex3.toISOString(),
          count: 3,
        },
      ],
      children: [],
    },
    referrers: [],
    contents: [],
    commits: {
      updated: false,
      data: [],
    },
  }).save();
}

describe("UserCtrl", () => {
  /* Connect to a new in-memory database before running any tests. */
  before(async () => await dbHandler.connect());

  /* Clear all test data after every test. */
  afterEach(async () => await dbHandler.clearDatabase());

  /* Remove and close the db and server. */
  after(async () => await dbHandler.closeDatabase());

  describe("getLastXDaysData", () => {
    it("#user undefined", async () => {
      let user;
      const { success, data } = await UserCtrl.getLastXDaysData(user, 30);
      expect(success).to.be.equal(false);
    });

    it("#user with no repositories", async () => {
      /* Mock the function environment */
      const t = await new TokenModel({ value: `dummy_token` }).save();

      const user = await new UserModel({
        username: `mock_user`,
        githubId: `1234567`,
        token_ref: t._id,
      }).save();

      /* Call function */
      const { success, data } = await UserCtrl.getLastXDaysData(user, 30);

      /* Assesrtions */
      expect(success).to.be.equal(true);
      expect(data.length).to.be.equal(0);
    });

    it("#user with one repository", async () => {
      /* Mock the function environment */
      const t = await new TokenModel({ value: `dummy_token` }).save();

      const user = await new UserModel({
        username: `mock_user`,
        githubId: `1234567`,
        token_ref: t._id,
      }).save();

      await createMockRepo1(user);

      /* Call function */
      const { success, data } = await UserCtrl.getLastXDaysData(user, 30);

      /* Assesrtions */
      expect(success).to.be.equal(true);
      expect(data.length).to.be.equal(1);
      expect(data[0].views_count).to.be.equal(60);
      expect(data[0].views_uniques).to.be.equal(30);
      expect(data[0].clones_count).to.be.equal(120);
      expect(data[0].clones_uniques).to.be.equal(90);
      expect(data[0].forks_count).to.be.equal(150);
    });

    it("#user with two repository", async () => {
      /* Mock the function environment */
      const t = await new TokenModel({ value: `dummy_token` }).save();

      const user = await new UserModel({
        username: `mock_user`,
        githubId: `1234567`,
        token_ref: t._id,
      }).save();

      await createMockRepo1(user);
      await createMockRepo2(user);

      /* Call function */
      const { success, data } = await UserCtrl.getLastXDaysData(user, 30);

      /* Assesrtions */
      expect(success).to.be.equal(true);
      expect(data.length).to.be.equal(2);

      const reponames = data.map((d) => d.reponame);
      expect(reponames).to.include.members([
        "mock_user/mock_repo1",
        "mock_user/mock_repo2",
      ]);

      let repo1, repo2;
      if (data[0].reponame === "mock_user/mock_repo1") {
        repo1 = data[0];
        repo2 = data[1];
      } else {
        repo1 = data[1];
        repo2 = data[0];
      }

      expect(repo1.views_count).to.be.equal(60);
      expect(repo1.views_uniques).to.be.equal(30);
      expect(repo1.clones_count).to.be.equal(120);
      expect(repo1.clones_uniques).to.be.equal(90);
      expect(repo1.forks_count).to.be.equal(150);

      expect(repo2.views_count).to.be.equal(30);
      expect(repo2.views_uniques).to.be.equal(15);
      expect(repo2.clones_count).to.be.equal(4);
      expect(repo2.clones_uniques).to.be.equal(3);
      expect(repo2.forks_count).to.be.equal(3);
    });
  });
});
