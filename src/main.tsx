import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { browserStorage, createStore } from './state/progress';
import { App } from './ui/App';
import './styles.css';

const store = createStore(browserStorage());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App store={store} />
  </StrictMode>,
);
