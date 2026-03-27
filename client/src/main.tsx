import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { CommerceProvider } from './context/CommerceContext'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <CommerceProvider>
          <App />
        </CommerceProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
