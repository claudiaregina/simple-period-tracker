import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/fonts.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import './styles/fonts.css';
import './fonts/IBMPlexMono-Bold.woff2';
import './fonts/IBMPlexMono-BoldItalic.woff2';
import './fonts/IBMPlexMono-Italic.woff2';
import './fonts/IBMPlexMono-Regular.woff2';
import './fonts/AtkinsonHyperlegible-Bold.woff2';
import './fonts/AtkinsonHyperlegible-BoldItalic.woff2';
import './fonts/AtkinsonHyperlegible-Italic.woff2';
import './fonts/AtkinsonHyperlegible-Regular.woff2';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();