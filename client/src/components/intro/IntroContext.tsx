import { createContext, useContext } from 'react';

/** `revealed` flips to true once the intro is finished (or was skipped). Hero motion waits for it. */
export const IntroContext = createContext({ revealed: true });
export const useIntro = () => useContext(IntroContext);
