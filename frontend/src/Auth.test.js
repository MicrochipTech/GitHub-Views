import React from "react";
import { AuthContext, AuthProvider } from "./Auth";
import { render, wait, getByText } from "@testing-library/react";
import axios from "axios";

jest.mock("axios");

describe("AuthContext", () => {
  it("provides provides user when logged in", async () => {
    const user = { name: "john" };
    axios.get.mockResolvedValueOnce({ data: user });

    const { debug, getByTestId } = render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(ctx) => {
            if (ctx.resolving) return <div data-testid="resolving"></div>;
            else
              return (
                <div data-testid="done">
                  <div data-testid="user">{JSON.stringify(ctx.user)}</div>
                </div>
              );
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );
    await wait(() => getByTestId("done"));
    expect(getByTestId("user")).toHaveTextContent(JSON.stringify(user));
  });

  it("provides provides error if no user logged in", async () => {
    axios.get.mockRejectedValueOnce();

    const { debug, getByTestId } = render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(ctx) => {
            if (ctx.resolving) return <div data-testid="resolving"></div>;
            else
              return (
                <div data-testid="done">
                  <div data-testid="error">{JSON.stringify(ctx.error)}</div>
                </div>
              );
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );
    debug();
    await wait(() => getByTestId("done"));
    debug();
    expect(getByTestId("error")).toHaveTextContent("not authenticated");
  });
});
