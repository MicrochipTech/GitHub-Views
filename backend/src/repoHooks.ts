import RepoModel, { IRepository } from "./models/Repository";

interface GhvRpoHooks {
  onRepoCreate?: (repo: IRepository) => void;
  onRepoNameUpdate?: (repo: IRepository) => void;
}

const onRepoCreate = (repo: IRepository) => {
  const ide = (() => {
    if (repo.reponame.includes("mplab")) return "mplab";
    if (repo.reponame.includes("studio")) return "studio";
    return "";
  })();

  const codeConfigurator = (() => {
    if (repo.reponame.includes("mcc")) return "mcc";
    if (repo.reponame.includes("start")) return "start";
    return "";
  })();

  const deviceFamily = repo.reponame;

  RepoModel.updateOne(
    { _id: repo._id },
    {
      $set: {
        metadata: {
          ide,
          codeConfigurator,
          deviceFamily,
        },
      },
    }
  );
};

const onRepoNameUpdate = (repo: IRepository) => {};

const hooks: GhvRpoHooks = {
  onRepoCreate,
  onRepoNameUpdate,
};

export default hooks;
