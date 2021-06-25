import React from "react";
import ReactDOM from "react-dom";
import "typeface-fjalla-one";
import "typeface-noto-sans";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";

Sentry.init({
  dsn:
    "https://529cf0665e3445318b9fc72b272a993b@o406957.ingest.sentry.io/5829833",
});

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
