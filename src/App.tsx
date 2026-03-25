import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'

import Layout from './components/Layout'
import Index from './pages/Index'
import AuthPage from './pages/auth/AuthPage'
import Dashboard from './pages/restrito/Dashboard'
import Projeto from './pages/institucional/Projeto'
import Bauru from './pages/institucional/Bauru'
import Desafios from './pages/institucional/Desafios'
import Equipe from './pages/institucional/Equipe'
import Cenarios from './pages/ssd/Cenarios'
import Configuracoes from './pages/ssd/Configuracoes'
import WorkPackage from './pages/resultados/WorkPackage'
import Publicacoes from './pages/divulgacao/Publicacoes'
import Midia from './pages/divulgacao/Midia'
import Congressos from './pages/divulgacao/Congressos'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/restrito" element={<Dashboard />} />

            <Route path="/institucional/projeto" element={<Projeto />} />
            <Route path="/institucional/bauru" element={<Bauru />} />
            <Route path="/institucional/desafios" element={<Desafios />} />
            <Route path="/institucional/equipe" element={<Equipe />} />

            <Route path="/ssd/cenarios" element={<Cenarios />} />
            <Route path="/ssd/configuracoes" element={<Configuracoes />} />

            <Route path="/resultados/:id" element={<WorkPackage />} />

            <Route path="/divulgacao/publicacoes" element={<Publicacoes />} />
            <Route path="/divulgacao/midia" element={<Midia />} />
            <Route path="/divulgacao/congressos" element={<Congressos />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
