import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import Layout from './components/Layout'
import Index from './pages/Index'
import AuthPage from './pages/auth/AuthPage'
import Dashboard from './pages/restrito/Dashboard'
import ResetPassword from './pages/auth/ResetPassword'
import AreaEstudoObjetivos from './pages/area-estudo/Objetivos'
import AreaEstudoDocumentos from './pages/area-estudo/Documentos'
import Camadas from './pages/area-estudo/Camadas'
import Projeto from './pages/institucional/Projeto'
import { GestaoCamadas } from '@/components/gestao-camadas/GestaoCamadas'
import Equipe from './pages/institucional/Equipe'
import Parceiros from './pages/institucional/Parceiros'
import ObjetivosInstitucionais from './pages/institucional/Objetivos'
import ObjetivosProjetos from './pages/projetos/Objetivos'
import ResultadosProjetos from './pages/projetos/Resultados'
import Cenarios from './pages/ssd/Cenarios'
import Configuracoes from './pages/ssd/Configuracoes'
import Publicacoes from './pages/divulgacao/Publicacoes'
import Midia from './pages/divulgacao/Midia'
import Congressos from './pages/divulgacao/Congressos'
import AtividadesSociais from './pages/divulgacao/AtividadesSociais'
import NotFound from './pages/NotFound'
import Placeholder from './pages/Placeholder'
import Contexto from './pages/area-estudo/Contexto'
import { GestaoProjetos } from '@/components/gestao-projetos/GestaoProjetos'

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
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/institucional/projeto" element={<Projeto />} />
            <Route path="/institucional/objetivos" element={<ObjetivosInstitucionais />} />
            <Route path="/institucional/parceiros" element={<Parceiros />} />
            <Route path="/institucional/equipe" element={<Equipe />} />
            <Route path="/area-estudo/contexto" element={<Contexto />} />
            <Route path="/area-estudo/objetivos" element={<AreaEstudoObjetivos />} />
            <Route path="/area-estudo/documentos" element={<AreaEstudoDocumentos />} />
            <Route path="/area-estudo/camadas" element={<Camadas />} />
            <Route path="/projetos/objetivos" element={<ObjetivosProjetos />} />
            <Route path="/projetos/resultados" element={<ResultadosProjetos />} />
            <Route path="/ssd/cenarios" element={<Cenarios />} />
            <Route path="/ssd/configuracoes" element={<Configuracoes />} />
            <Route path="/divulgacao/publicacoes" element={<Publicacoes />} />
            <Route path="/divulgacao/midia" element={<Midia />} />
            <Route path="/divulgacao/congressos" element={<Congressos />} />
            <Route path="/divulgacao/atividades-sociais" element={<AtividadesSociais />} />
            <Route path="/restrito" element={<Dashboard />} />
            <Route path="/restrito/projetos" element={<GestaoProjetos />} />
            <Route path="/restrito/camadas" element={<GestaoCamadas />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
