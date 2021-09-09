process.env.TOKEN_ENC_KEY = `W9fYNQnPD9Xw+S/lhJlJIoIVLIlYaN9VXuOKGNpleKY=`;
process.env.TOKEN_SIG_KEY = `ET8V/w1JaNQrgRqeGzlFCoucarIrVktu1duJGnSVHlKzreSKQXLuoxEQhZYIGMdiVWfPmCZRBVeUALCgPjgPsw==`;

const RepositoryModel = require("../models/Repository").default;
const UserModel = require("../models/User").default;
const TokenModel = require("../models/Token").default;
const { createMockRepo1, createMockRepo2 } = require("./createMockRepo");

const UserCtrl = require("../controllers/UserCtrl");
const { expect } = require("chai");
const dbHandler = require("./db-handler");

describe("UserCtrl", () => {
  /* Connect to a new in-memory database before running any tests. */
  before(async () => await dbHandler.connect());

  /* Clear all test data after every test. */
  afterEach(async () => await dbHandler.clearDatabase());

  /* Remove and close the db and server. */
  after(async () => await dbHandler.closeDatabase());

  describe("getLastXDaysData", () => {
    it("#user undefined", async () => {
      const user;
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

      const repos = await RepositoryModel.find({});

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
