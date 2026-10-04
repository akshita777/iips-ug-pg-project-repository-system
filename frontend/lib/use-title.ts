"use client";

import * as React from "react";

const SUFFIX = "IIPS Project Portal";

/** Sets the tab title for client-only routes that cannot export metadata. */
export function usePageTitle(title: string) {
  React.useEffect(() => {
    const previous = document.title;
    document.title = `${title} | ${SUFFIX}`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
