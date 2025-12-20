import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Estilos base por si acaso
import './index.css' 

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} else {
  console.error("No se encontró el elemento 'root' en el HTML. Revisa index.html");
}