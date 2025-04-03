import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// import theme from './theme.ts'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './components/ThemeProvider'
import {Provider} from "react-redux";
import {store} from "./redux/store.tsx"
import { Toaster } from 'sonner';
import TagManager from 'react-gtm-module'
import {Analytics} from "@vercel/analytics/react"

const tagManagerArgs = {
  gtmId: 'GTM-KDLPMHHL'
}

TagManager.initialize(tagManagerArgs)

createRoot(document.getElementById('root')!).render(
      <Provider store={store}>
        <ThemeProvider>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID!}>
            <Toaster position="top-center" richColors />
            <App />
            <Analytics/>
          </GoogleOAuthProvider> 
        </ThemeProvider>
      </Provider>
)
