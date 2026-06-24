import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { seedDatabase } from './db/seeds';
import './index.css';

seedDatabase().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
