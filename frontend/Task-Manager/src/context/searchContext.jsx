import React, { createContext, useState } from "react";

export const SearchContext = createContext();

const SearchProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useState({});

  return (
    <SearchContext.Provider value={{ searchParams, setSearchParams }}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchProvider;
