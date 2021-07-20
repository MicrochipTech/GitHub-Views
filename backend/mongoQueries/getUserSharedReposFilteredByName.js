module.exports = (user_id, search) => [
  {
    $match: { _id: user_id },
  },
  {
    $unwind: { path: "$sharedRepos", preserveNullAndEmptyArrays: true },
  },
  {
    $lookup: {
      from: "repositories",
      let: { repo_id: "$sharedRepos" },
      pipeline: [
        {
          $match: {
            reponame: { $regex: search },
            $expr: {
              $eq: ["$_id", "$$repo_id"],
            },
          },
        },
      ],
      as: "sharedRepos",
    },
  },
  {
    $unwind: { path: "$sharedRepos", preserveNullAndEmptyArrays: true },
  },
  {
    $group: {
      _id: "$_id",
      username: { $first: "$username" },
      password: { $first: "$password" },
      githubEmails: { $first: "$githubEmails" },
      githubId: { $first: "$githubId" },
      token: { $first: "$token" },
      token_ref: { $first: "$token_ref" },
      sharedRepos: { $push: "$sharedRepos" },
    },
  },
];
