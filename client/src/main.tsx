import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from './components/Providers/Provider.tsx'
import Layout from './components/global/Layout.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <Layout>
        <App />
      </Layout>
    </Provider>
  </StrictMode>,
)
