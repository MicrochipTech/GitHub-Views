import RepoModel, { Repository } from "./models/Repository";

interface GhvRpoHooks {
  onRepoCreate?: (repo: Repository) => void;
  onRepoNameUpdate?: (repo: Repository) => void;
}

const onRepoCreate = (repo: Repository) => {
  const ide = (() => {
    const match = repo.reponame.match(/(-|^)(studio|mplab)(-|$)/i);
    if (match) return match[2];
    return "";
  })();

  const codeConfigurator = (() => {
    const match = repo.reponame.match(/(-|^)(start|mcc)(-|$)/i);
    if (match) return match[2];
    return "";
  })();

  const deviceFamily = (() => {
    let match;
    match = repo.reponame.match(/(avr)([0-9]*|-)(da|dd|db)/i);
    if (match) {
      return `${match[1]} ${match[3]}`;
    }

    match = repo.reponame.match(/at(tiny|mega)[0-9]{1,2}(0|1|2)[0-9]/i);
    if (match) {
      return `${match[1]}AVR ${match[2]}-series`;
    }

    match = repo.reponame.match(/PIC18F[0-9]{2}(Q|K)([0-9]{2})/i);
    if (match) {
      return `PIC18F${match[1]}${match[2]}`;
    }

    match = repo.reponame.match(/PIC16[F|LF]([0-9]{3})[0-9]{1,2}/i);
    if (match) {
      return `PIC16F${match[1]}`;
    }

    return "";
  })();

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
  ).exec();
};

const onRepoNameUpdate = (repo: Repository) => {};

const hooks: GhvRpoHooks = {
  onRepoCreate,
  onRepoNameUpdate,
};

export default hooks;
