import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
import type { AxiosError } from 'axios'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      // No refetch storm when tabbing back to the page.
      refetchOnWindowFocus: false,
      // A 4xx won't fix itself; only retry network failures and 5xx.
      retry: (count, error) => {
        const status = (error as AxiosError).response?.status
        return count < 2 && (status === undefined || status >= 500)
      },
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
