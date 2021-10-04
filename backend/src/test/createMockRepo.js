const RepositoryModel = require("../models/Repository").default;

export async function createMockRepo1(user) {
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
  
    const viewsMock = mockTraffic.map((t) => {
      return { timestamp: t.timestamp, count: 2, uniques: 1 };
    });
  
    const clonesMock = mockTraffic.map((t) => {
      return { timestamp: t.timestamp, count: 4, uniques: 3 };
    });
  
    const forksMock = mockTraffic.map((t) => {
      return { timestamp: t.timestamp, count: 5 };
    });
  
    await new RepositoryModel({
      not_found: false,
      users: [user._id],
      github_repo_id: `134574268`,
      reponame: `mock_user/mock_repo1`,
      views: {
        total_count: viewsMock.reduce((acc, data) => acc + data.count, 0),
        total_uniques: viewsMock.reduce((acc, data) => acc + data.uniques, 0),
        data: viewsMock,
      },
      clones: {
        total_count: clonesMock.reduce((acc, data) => acc + data.count, 0),
        total_uniques: clonesMock.reduce((acc, data) => acc + data.uniques, 0),
        data: clonesMock,
      },
      forks: {
        tree_updated: false,
        data: forksMock,
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
  
  export async function createMockRepo2(user) {
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
  
    const viewsMock = mockTraffic.map((t) => {
      return { timestamp: t.timestamp, count: 2, uniques: 1 };
    });
  
    const clonesMock = [
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
    ];
  
    const forksMock = [
      {
        timestamp: timeIndex1.toISOString(),
        count: 7,
      },
      {
        timestamp: timeIndex3.toISOString(),
        count: 3,
      },
    ];
  
    await new RepositoryModel({
      not_found: false,
      users: [user._id],
      github_repo_id: `134574269`,
      reponame: `mock_user/mock_repo2`,
      views: {
        total_count: viewsMock.reduce((acc, data) => acc + data.count, 0),
        total_uniques: viewsMock.reduce((acc, data) => acc + data.uniques, 0),
        data: viewsMock,
      },
      clones: {
        total_count: clonesMock.reduce((acc, data) => acc + data.count, 0),
        total_uniques: clonesMock.reduce((acc, data) => acc + data.uniques, 0),
        data: clonesMock,
      },
      forks: {
        tree_updated: false,
        data: forksMock,
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