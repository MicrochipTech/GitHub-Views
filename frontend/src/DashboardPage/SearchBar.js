import React from "react";
import TextField from "@material-ui/core/TextField";

function SearchBar({ onSearch, show }) {
  const [searchValue, setSearchValue] = React.useState();

  if (!show) {
    return null;
  }

  return (
    <TextField
      fullWidth
      style={{ marginTop: "20px", marginBottom: "10px" }}
      onChange={e => {
        setSearchValue(e.target.value);
      }}
      onKeyPress={e => {
        if (e.key === "Enter") {
          if (onSearch) {
            onSearch(searchValue);
          }
        }
      }}
      id="outlined-size-small"
      label="Type and Press Enter to Search Repositories"
      variant="outlined"
      size="small"
      value={searchValue}
    />
  );
}

export default SearchBar;
