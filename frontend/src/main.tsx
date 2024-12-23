import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// import { ChakraProvider } from '@chakra-ui/react'
// import theme from './theme.ts'
import { ThemeProvider } from './components/ThemeProvider'
import {Provider} from "react-redux";
import {store} from "./redux/store.tsx"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <Provider store={store}>
        {/*<ChakraProvider theme={theme}>*/}
            <ThemeProvider>
                <App />
            </ThemeProvider>
        {/*</ChakraProvider>*/}
      </Provider>
  </StrictMode>
)
