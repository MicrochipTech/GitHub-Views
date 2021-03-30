module.exports = (
  query,
  dateStart,
  dateEnd,
  projection = {
    not_found: true,
    users: true,
    github_repo_id: true,
    reponame: true,
    views: true,
    clones: true,
    forks: true,
    referrers: true,
    contents: true,
    nameHistory: true,
    commits: true,
  }
) => {
  const fileds = {};

  if (projection.not_found === true) {
    fileds.not_found = true;
  }

  if (projection.users === true) {
    fileds.users = true;
  }

  if (projection.github_repo_id === true) {
    fileds.github_repo_id = true;
  }

  if (projection.reponame === true) {
    fileds.reponame = true;
  }

  if (projection.views === true) {
    fileds.views = {
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
    };
  }

  if (projection.clones === true) {
    fileds.clones = {
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
    };
  }

  if (projection.forks === true) {
    fileds.forks = {
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
    };
  }

  if (projection.referrers === true) {
    fileds.referrers = {
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
    };
  }

  if (projection.contents === true) {
    fileds.contents = {
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
    };
  }

  if (projection.nameHistory === true) {
    fileds.nameHistory = {
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
    };
  }

  if (projection.commits === true) {
    fileds.commits = {
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
    };
  }

  const pipeline = [
    {
      $match: query,
    },
    {
      $project: {
        ...fileds,
      },
    },
  ];

  return pipeline;
};
