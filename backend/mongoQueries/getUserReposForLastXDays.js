module.exports = (user_id, dateStart, dateEnd) => [
  {
    $match: {
      not_found: false,
      users: { $eq: user._id },
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
              $gte: ["$$view.timestamp", oneMonthAgo],
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
              $gte: ["$$clone.timestamp", oneMonthAgo],
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
              $gte: ["$$fork.timestamp", oneMonthAgo],
            },
          },
        },
      },
    },
  },
  {
    $unwind: { path: "$views.data", preserveNullAndEmptyArrays: true },
  },
  {
    $group: {
      _id: "$_id",
      reponame: { $first: "$reponame" },
      views_count: { $sum: "$views.data.count" },
      views_uniques: { $sum: "$views.data.uniques" },
      clones: { $first: "$clones" },
      forks: { $first: "$forks" },
    },
  },
  {
    $unwind: { path: "$clones.data", preserveNullAndEmptyArrays: true },
  },
  {
    $group: {
      _id: "$_id",
      reponame: { $first: "$reponame" },
      views_count: { $first: "$views_count" },
      views_uniques: { $first: "$views_uniques" },
      clones_count: { $sum: "$clones.data.count" },
      clones_uniques: { $sum: "$clones.data.uniques" },
      forks: { $first: "$forks" },
    },
  },
  {
    $unwind: { path: "$forks.data", preserveNullAndEmptyArrays: true },
  },
  {
    $group: {
      _id: "$_id",
      reponame: { $first: "$reponame" },
      views_count: { $first: "$views_count" },
      views_uniques: { $first: "$views_uniques" },
      clones_count: { $first: "$clones_count" },
      clones_uniques: { $first: "$clones_uniques" },
      forks_count: { $sum: "$forks.data.count" },
    },
  },
];
