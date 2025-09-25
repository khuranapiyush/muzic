import * as React from 'react';

export const navigationRef = React.createRef();

export function navigate(name, params) {
  if (navigationRef.current) {
    try {
      navigationRef.current.navigate(name, params);
    } catch (_) {}
  }
}

export function getCurrentRoute() {
  try {
    return navigationRef.current?.getCurrentRoute();
  } catch (_) {
    return null;
  }
}

export default {
  navigationRef,
  navigate,
  getCurrentRoute,
};
