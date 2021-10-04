import React, { useContext } from "react";
import { Box, Button } from "@material-ui/core";
import { useFormik } from "formik";
import { AuthContext } from "../Auth";
import { init } from "@sentry/browser";

type Repo = any; // todo

interface MetadataTabProps {
  repo: Repo;
}

const MetadataTab: React.FC<MetadataTabProps> = ({ repo }) => {
  const { user } = useContext(AuthContext);

  const repoMetadata = user.appConfig.forAllRepos.repoMetadata;

  const initialValues = repoMetadata.reduce(
    (acc: Record<string, string>, v: string) => {
      acc[v] = repo.metadata?.[v] ?? "";
      return acc;
    },
    {}
  );

  const formik = useFormik({
    initialValues,
    onSubmit: (v: typeof initialValues) => {
      console.log("v: ", v);
      patch(v);
    },
  });

  const patch = async (metadata: typeof initialValues) => {
    const res = await fetch(`/api/rest/api/v1/Repository/${repo._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metadata,
      }),
    });
    alert("Saved.");
  };

  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        {repoMetadata.map((m: string) => (
          <Box mb={2}>
            <label htmlFor={m}>{m}</label>
            <br />
            <input
              id={m}
              name={m}
              type="text"
              onChange={formik.handleChange}
              value={formik.values[m]}
            />
          </Box>
        ))}
        <Button type="submit">Save</Button>
      </form>
    </div>
  );
};

export default MetadataTab;
