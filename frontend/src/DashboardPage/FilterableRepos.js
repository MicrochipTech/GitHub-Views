import React from "react";
import TextField from "@material-ui/core/TextField";
import { FormControlLabel, Checkbox } from "@material-ui/core";

function FilterableRepos({ allRepos, onChange, selectedRepos }) {
  const [values, setValues] = React.useState(
    allRepos.map((r) => selectedRepos.indexOf(r._id) !== -1)
  );

  React.useEffect(() => {
    setValues(allRepos.map((r) => selectedRepos.indexOf(r._id) !== -1));
  }, [selectedRepos]);

  const [searchAggFilter, setSearchAggFilter] = React.useState("");
  const reposMatchingSearch = allRepos
    .map((i, idx) => ({ ...i, originalIdx: idx }))
    .filter((d) =>
      d.reponame.match(new RegExp(`${searchAggFilter.trim()}`, "i"))
    );

  // console.log("reposMatchingSearch: ", reposMatchingSearch);

  return (
    <div>
      <TextField
        className="padding20"
        label="Search"
        variant="outlined"
        style={{ width: "100%" }}
        value={searchAggFilter}
        onChange={(e) => {
          setSearchAggFilter(e.target.value);
        }}
      />
      {reposMatchingSearch.length !== 0 &&
        reposMatchingSearch.map((r, idx) => (
          <div key={idx} style={{ disaply: "flex", wordBreak: "break-word" }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={values[r.originalIdx]}
                  onChange={(e) => {
                    const newValues = [...values];
                    newValues[r.originalIdx] = e.target.checked;
                    // console.log(r.originalIdx);
                    setValues(newValues);
                    if (onChange) {
                      onChange(r._id, e.target.checked);
                    }
                  }}
                  color="primary"
                />
              }
              label={r.reponame}
            />
          </div>
        ))}
      {allRepos.length === 0 && (
        <div>
          <h3>You don't have any repositories.</h3>
        </div>
      )}
    </div>
  );
}

export default FilterableRepos;
