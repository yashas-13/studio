
import { onSnapshot, DocumentData, Query, Unsubscribe } from 'firebase/firestore';

export const safeOnSnapshot = (
  query: Query<DocumentData>,
  callback: (snapshot: DocumentData) => void
): Unsubscribe => {
  let unsubscribe: Unsubscribe | null = null;

  const wrappedCallback = (snapshot: DocumentData) => {
    if (unsubscribe) {
      callback(snapshot);
    }
  };

  unsubscribe = onSnapshot(query, wrappedCallback);

  return () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };
};
