import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// No StrictMode: the Living Portrait engine binds to the DOM once and must not be started twice.
createRoot(document.getElementById('root')!).render(<App />);
