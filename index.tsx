import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProviders } from './providers';
import './index.css';

console.log("index.tsx: Script loading...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("index.tsx: Could not find root element to mount to");
  throw new Error("Could not find root element to mount to");
}
console.log("index.tsx: Root element found:", rootElement);


const root = ReactDOM.createRoot(rootElement);
console.log("index.tsx: Rendering React application...");
root.render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
console.log("index.tsx: React application rendered.");