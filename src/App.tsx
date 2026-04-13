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
import Equipe from './pages/institucional/Equipe'
import Cenarios from './pages/ssd/Cenarios'
import Configuracoes from './pages/ssd/Configuracoes'
import Publicacoes from './pages/divulgacao/Publicacoes'
import Midia from './pages/divulgacao/Midia'
import Congressos from './pages/divulgacao/Congressos'
import NotFound from './pages/NotFound'
import Placeholder from './pages/Placeholder'
import Contexto from './pages/area-estudo/Contexto'

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

            <Route path="/institucional/projeto" element={<Projeto />} />
            <Route
              path="/institucional/objetivos"
              element={<Placeholder title="Objetivos Institucionais" />}
            />
            <Route path="/institucional/parceiros" element={<Placeholder title="Parceiros" />} />
            <Route path="/institucional/equipe" element={<Equipe />} />

            <Route path="/area-estudo/contexto" element={<Contexto />} />
            <Route
              path="/area-estudo/objetivos"
              element={<Placeholder title="Objetivos da Área de Estudo" />}
            />
            <Route path="/area-estudo/documentos" element={<Placeholder title="Documentos" />} />
            <Route path="/area-estudo/camadas" element={<Placeholder title="Camadas (Mapas)" />} />

            <Route
              path="/projetos/objetivos"
              element={<Placeholder title="Objetivos dos Projetos" />}
            />
            <Route
              path="/projetos/resultados"
              element={<Placeholder title="Resultados dos Projetos" />}
            />

            <Route path="/ssd/cenarios" element={<Cenarios />} />
            <Route path="/ssd/configuracoes" element={<Configuracoes />} />

            <Route path="/divulgacao/publicacoes" element={<Publicacoes />} />
            <Route path="/divulgacao/midia" element={<Midia />} />
            <Route path="/divulgacao/congressos" element={<Congressos />} />
            <Route
              path="/divulgacao/atividades-sociais"
              element={<Placeholder title="Atividades Sociais" />}
            />

            <Route path="/restrito" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
