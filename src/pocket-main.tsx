import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Pocket from './Pocket'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Pocket />
  </StrictMode>,
)
