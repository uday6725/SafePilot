import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@appwrite.io/pink-icons";
import './App.css'
import AppLayout from './AppLayout.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppLayout />
  </StrictMode>,
)
