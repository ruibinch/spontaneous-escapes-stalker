import { IS_SERVER } from '@/common/env';
import { differenceInCalendarDays } from 'date-fns';
import React, { createContext, useState } from 'react';

// TODO: pull this from changelog.md instead of hardcoding here
const LAST_CHANGELOG_ITEM_DATE = '2024-08-14';
const VIEWED_CHANGELOG_STORAGE_KEY = 'viewed-changelog';
const NEW_ITEM_VALIDITY_DAYS = 30;

interface NewChangelogItemContext {
  hasNewItem: boolean;
  markItemAsViewed: () => void;
}
const NewChangelogItemContext = createContext<NewChangelogItemContext>({
  hasNewItem: false,
  markItemAsViewed: () => {},
});

export const useNewChangelogItemContext = () => {
  return React.useContext(NewChangelogItemContext);
};

export const NewChangelogItemContextProvider = (props: {
  children: React.ReactNode;
}) => {
  const [hasNewItem, setNewItem] = useState(getHasNewChangelogItem());

  const markItemAsViewed = () => {
    localStorage.setItem(
      VIEWED_CHANGELOG_STORAGE_KEY,
      LAST_CHANGELOG_ITEM_DATE,
    );
    setNewItem(false);
  };

  return (
    <NewChangelogItemContext.Provider value={{ hasNewItem, markItemAsViewed }}>
      {props.children}
    </NewChangelogItemContext.Provider>
  );
};

/**
 * A changelog item is considered "new" if:
 * - The item was published within the last 14 days
 * - The user has not viewed it yet
 */
const getHasNewChangelogItem = () => {
  // check relies on localStorage so can only be done on client-side
  if (IS_SERVER) return false;

  const isWithinValidityPeriod =
    differenceInCalendarDays(new Date(), new Date(LAST_CHANGELOG_ITEM_DATE)) <=
    NEW_ITEM_VALIDITY_DAYS;
  const lastViewedChangelogItem = localStorage.getItem(
    VIEWED_CHANGELOG_STORAGE_KEY,
  );

  return (
    isWithinValidityPeriod &&
    lastViewedChangelogItem !== LAST_CHANGELOG_ITEM_DATE
  );
};
