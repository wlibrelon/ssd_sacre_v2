import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function Configuracoes() {
  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-primary">Configurações Avançadas do SSD</h1>
        <p className="text-muted-foreground">
          Definições para os modelos de simulação Python do backend.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Integração de Modelos (WEAP / MODFLOW)</CardTitle>
          <CardDescription>
            Ative os modelos específicos que devem ser engatilhados na simulação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">WEAP - Planejamento Hídrico</Label>
              <p className="text-sm text-muted-foreground">
                Modelo base para balanço hídrico urbano.
              </p>
            </div>
            <Switch checked disabled />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">MODFLOW - Águas Subterrâneas</Label>
              <p className="text-sm text-muted-foreground">
                Simulação detalhada do aquífero Guarani/Bauru.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">SWMM - Fluxo Superficial</Label>
              <p className="text-sm text-muted-foreground">
                Impacto das chuvas intensas e drenagem urbana.
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Salvar Configurações</Button>
      </div>
    </div>
  )
}
