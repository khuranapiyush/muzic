import React, { Fragment } from 'react';
import ListView from './ListView';

const SearchMapping = {
  ListView: ListView,
};

const defaultViewType = 'ListView';

const Search = ({ as, ...rest }) => {
  if (!(as && SearchMapping[as])) {
    return <Fragment />;
  }
  const ComponentType =
    (as && SearchMapping[as]) ?? SearchMapping[defaultViewType];
  return <ComponentType {...rest} />;
};

export default Search;
