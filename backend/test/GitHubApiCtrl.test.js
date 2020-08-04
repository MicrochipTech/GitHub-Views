/* eslint-disable no-undef */
const nock = require("nock");
const { expect } = require("chai");
const { getUserRepos } = require("../controllers/GitHubApiCtrl");

describe("GitHubApiCtrl", () => {
  describe("getUserRepos", () => {
    it("should get user repositories", async () => {
      const userRepos = [
        {
          reponame: "Foo"
        },
        {
          reponame: "Bar"
        }
      ];

      nock("https://api.github.com/")
        .get("/user/repos")
        .query(true)
        .reply(200, [userRepos[0]]);

      nock("https://api.github.com/")
        .get("/user/repos")
        .query(true)
        .reply(200, [userRepos[1]]);

      nock("https://api.github.com/")
        .get("/user/repos")
        .query(true)
        .reply(200, []);

      const res = await getUserRepos("dummyTocken");
      expect(res.success).to.be.equal(true);
      expect(res.data).to.deep.equal(userRepos);
    });

    it("should return error code", async () => {
      nock("https://api.github.com/")
        .get("/user/repos")
        .query(true)
        .reply(403, []);

      const res = await getUserRepos("dummyTocken");
      expect(res.success).to.be.equal(false);
      expect(res.status).to.deep.equal(403);
    });
  });
});
