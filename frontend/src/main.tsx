import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// import theme from './theme.ts'
import { ThemeProvider } from './components/ThemeProvider'
import {Provider} from "react-redux";
import {store} from "./redux/store.tsx"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <Provider store={store}>
        <ThemeProvider>
            <App />
        </ThemeProvider>
      </Provider>
  </StrictMode>
)
