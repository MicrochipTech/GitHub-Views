import React from "react";
import { render, fireEvent } from "@testing-library/react";

import Navigation from "./Navigation";
import { DataContext } from "../Data";
import { AuthContext } from "../Auth";

jest.mock("react-router-dom", () => ({
  useHistory: () => ({
    push: jest.fn(),
  }),
}));

describe("Navigation", () => {
  it("renders for non gh users", () => {
    const { getByTestId, debug } = render(
      <AuthContext.Provider value={{ user: { githubId: null } }}>
        <DataContext.Provider value={{ syncRepos: jest.fn() }}>
          <Navigation />
        </DataContext.Provider>
      </AuthContext.Provider>
    );
    expect(getByTestId("sharedRepos")).toBeInTheDocument();
    expect(getByTestId("aggregateCharts")).toBeInTheDocument();
  });

  it("renders for gh users", () => {
    const { getByTestId, debug } = render(
      <AuthContext.Provider value={{ user: { githubId: 1 } }}>
        <DataContext.Provider value={{ syncRepos: jest.fn() }}>
          <Navigation />
        </DataContext.Provider>
      </AuthContext.Provider>
    );
    expect(getByTestId("userRepos")).toBeInTheDocument();
    expect(getByTestId("sharedRepos")).toBeInTheDocument();
    expect(getByTestId("aggregateCharts")).toBeInTheDocument();
  });

  it("triggers sync on click", () => {
    const syncCb = jest.fn();
    const { getByTestId, debug } = render(
      <AuthContext.Provider value={{ user: { githubId: 1 } }}>
        <DataContext.Provider value={{ syncRepos: syncCb }}>
          <Navigation />
        </DataContext.Provider>
      </AuthContext.Provider>
    );
    fireEvent.click(getByTestId("syncBtn"));
    expect(syncCb.mock.calls.length).toBe(1);
  });
});
