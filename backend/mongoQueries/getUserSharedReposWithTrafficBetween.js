module.exports = (user_id, dateStart, dateEnd) => [
  {
    $match: {
      _id: user_id,
    },
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
            $expr: {
              $eq: ["$_id", "$$repo_id"],
            },
          },
        },
        {
          $project: {
            reponame: true,
            views: {
              data: {
                $filter: {
                  input: "$views.data",
                  as: "view",
                  cond: {
                    $and: [
                      { $gte: ["$$view.timestamp", dateStart] },
                      { $lte: ["$$view.timestamp", dateEnd] },
                    ],
                  },
                },
              },
            },
            clones: {
              data: {
                $filter: {
                  input: "$clones.data",
                  as: "clone",
                  cond: {
                    $and: [
                      { $gte: ["$$clone.timestamp", dateStart] },
                      { $lte: ["$$clone.timestamp", dateEnd] },
                    ],
                  },
                },
              },
            },
            forks: {
              data: {
                $filter: {
                  input: "$forks.data",
                  as: "fork",
                  cond: {
                    $and: [
                      { $gte: ["$$fork.timestamp", dateStart] },
                      { $lte: ["$$fork.timestamp", dateEnd] },
                    ],
                  },
                },
              },
            },
            referrers: {
              $map: {
                input: "$referrers",
                as: "referrer",
                in: {
                  name: "$$referrer.name",
                  data: {
                    $filter: {
                      input: "$$referrer.data",
                      as: "ref_data",
                      cond: {
                        $and: [
                          { $gte: ["$$ref_data.timestamp", dateStart] },
                          { $lte: ["$$ref_data.timestamp", dateEnd] },
                        ],
                      },
                    },
                  },
                },
              },
            },
            contents: {
              $map: {
                input: "$contents",
                as: "content",
                in: {
                  name: "$$content.name",
                  data: {
                    $filter: {
                      input: "$$content.data",
                      as: "ref_data",
                      cond: {
                        $and: [
                          { $gte: ["$$ref_data.timestamp", dateStart] },
                          { $lte: ["$$ref_data.timestamp", dateEnd] },
                        ],
                      },
                    },
                  },
                },
              },
            },
            nameHistory: {
              $filter: {
                input: "$nameHistory",
                as: "name",
                cond: {
                  $and: [
                    { $gte: ["$$name.date", dateStart] },
                    { $lte: ["$$name.date", dateEnd] },
                  ],
                },
              },
            },
            commits: {
              data: {
                $filter: {
                  input: "$commits.data",
                  as: "commit",
                  cond: {
                    $and: [
                      { $gte: ["$$commit.timestamp", dateStart] },
                      { $lte: ["$$commit.timestamp", dateEnd] },
                    ],
                  },
                },
              },
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
