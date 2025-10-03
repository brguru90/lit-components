import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'vg/index.css';
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <h1>React19 Demo</h1>
    <App />
  </StrictMode>,
)
