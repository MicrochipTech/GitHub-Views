import React, { useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import { useDebounce } from "use-debounce";

function SearchBar({ onSearch, show }) {
  const [searchValue, setSearchValue] = React.useState(null);
  const [debouncedSearchValue] = useDebounce(searchValue, 1000);

  useEffect(() => {
    if (debouncedSearchValue !== null) {
      onSearch(debouncedSearchValue);
    }
  }, [debouncedSearchValue, onSearch]);

  if (!show) {
    return null;
  }

  return (
    <TextField
      fullWidth
      style={{ marginTop: "20px", marginBottom: "10px" }}
      onChange={(e) => {
        setSearchValue(e.target.value);
      }}
      id="outlined-size-small"
      label="Type to Search Repositories"
      variant="outlined"
      size="small"
      value={searchValue}
    />
  );
}

export default SearchBar;
