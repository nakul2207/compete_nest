import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// import theme from './theme.ts'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './components/ThemeProvider'
import {Provider} from "react-redux";
import {store} from "./redux/store.tsx"
import { Toaster } from 'sonner';


createRoot(document.getElementById('root')!).render(
      <Provider store={store}>
        <ThemeProvider>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID!}>
            <Toaster position="top-right" richColors />
            <App />
          </GoogleOAuthProvider> 
        </ThemeProvider>
      </Provider>
)
