import React from "react";
import { DataProvider } from "./Data";
import { render } from "@testing-library/react";
import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

it("bla", () => {
  fetch.mockResponseOnce(
    JSON.stringify({
      userRepos: [],
      sharedRepos: [],
      aggregateCharts: [],
      zombieRepos: [],
    })
  );
  render(<DataProvider></DataProvider>);
});
