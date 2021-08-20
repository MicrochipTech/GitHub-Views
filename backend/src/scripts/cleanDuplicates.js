const RepositoryModel = require("../models/Repository").default;
const _ = require("lodash");

const cleanDuplicates = async () => {
  const merge_data = (arr, timestamp = "timestamp") => {
    const merged = arr.reduce((acc, v) => [...acc, ...v], []);
    const uniq = _.uniqBy(merged, timestamp);
    uniq.sort((a, b) => {
      if (new Date(a[timestamp]).getTime() > new Date(b[timestamp]).getTime()) {
        return 1;
      } else {
        return -1;
      }
    });
    return uniq;
  };

  let it = 0;

  for await (const repo of RepositoryModel.find({
    not_found: false,
  }).cursor()) {
    console.log("it: ", it++, repo.reponame);

    const not_founds = await RepositoryModel.find({
      reponame: repo.reponame,
      not_found: true,
    });

    if (not_founds.length === 0) continue;

    for (const f of ["views", "clones", "forks", "commits"]) {
      repo[f].data = merge_data([
        repo[f].data,
        ...not_founds.map((r) => r[f].data),
      ]);
    }

    repo.nameHistory = merge_data(
      [repo.nameHistory, ...not_founds.map((r) => r.nameHistory)],
      "date"
    );

    for (const { contents, path } of [
      { contents: "contents", path: "path" },
      { contents: "referrers", path: "name" },
    ]) {
      const all_contents = [
        ...repo[contents],
        ...not_founds.reduce((acc, r) => [...acc, ...r[contents]], []),
      ];

      const new_contents = [];
      const processed_contents = [];

      for (const content of all_contents) {
        if (!processed_contents.includes(content[path])) {
          const others = all_contents.filter((i) => i[path] === content[path]);
          const merged = merge_data(others.map((i) => i.data));
          new_contents.push({ ...content.toJSON(), data: merged });
          processed_contents.push(content[path]);
        }
      }
      repo[contents] = new_contents;
    }

    repo.save();
    not_founds.forEach((r) => r.deleteOne());
  }
};

if (require.main === module) {
  cleanDuplicates();
}

module.exports = cleanDuplicates;
