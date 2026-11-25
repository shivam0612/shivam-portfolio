import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { INTRO_SEEN_KEY } from '../components/intro/IntroGate';

/** Renders the whole app at a route, skipping the intro (as a returning visitor would see it). */
export function renderApp(path = '/') {
  sessionStorage.setItem(INTRO_SEEN_KEY, '1');
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

/** matchMedia stub where only the listed queries match. */
export function stubMatchMedia(matching: (query: string) => boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: matching(query),
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }),
  });
}
