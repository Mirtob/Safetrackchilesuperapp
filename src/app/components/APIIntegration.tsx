import { useState } from 'react';
import { ArrowLeft, Key, Copy, Eye, EyeOff, Code, Check, ExternalLink } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';
import { Badge } from '@/app/components/ui/badge';

interface APIIntegrationProps {
  onBack: () => void;
}

export function APIIntegration({ onBack }: APIIntegrationProps) {
  const [showKey, setShowKey] = useState(false);
  const [apiKey] = useState('stc_live_k8j2h4g9f7d6s5a3q1w0e8r7t6y5');
  const [endpoint] = useState('https://api.safetrack.cl/v1/executive-dashboard');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  const exampleCode = `// Ejemplo de integración con JavaScript
fetch('${endpoint}', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Datos ejecutivos:', data);
  // {
  //   compliance: 92,
  //   assets: 78,
  //   training: 85,
  //   financialSavings: 30300000,
  //   inspections: 248,
  //   workers: 1247,
  //   branches: 15,
  //   incidents: 3
  // }
})
.catch(error => console.error('Error:', error));`;

  const pythonExample = `# Ejemplo para Python / Django / Flask
import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get('${endpoint}', headers=headers)
data = response.json()
print(f"Cumplimiento: {data['compliance']}%")`;

  const powerBIExample = `// Power BI / M Language
let
    Source = Json.Document(
        Web.Contents(
            "${endpoint}",
            [Headers=[Authorization="Bearer YOUR_API_KEY"]]
        )
    )
in
    Source`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20 lg:pb-6">
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <button onClick={onBack} className="flex items-center gap-2 text-white/70 hover:text-white mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          <h1 className="text-white text-xl lg:text-2xl font-bold">Integración API - Modo Developer</h1>
          <p className="text-sm text-white/60">Conecta SafeTrack con tus sistemas corporativos</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
        <Card className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border-cyan-500/30">
          <div className="p-6">
            <h3 className="text-white font-bold text-lg mb-3">💡 El Valor de la Integración</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              <strong>"Don Gerente, mi servicio no es solo papel y charlas."</strong><br/>
              Le entrego una <strong>llave digital (API)</strong>. Su equipo de IT puede conectar mi sistema de prevención con el tablero de control de su empresa. 
              <br/><br/>
              <strong>Usted no necesita mi app</strong>; usted podrá ver en su propia pantalla, junto con sus ventas y producción, cómo hemos bajado el riesgo de multas y accidentes en tiempo real. 
              <br/><br/>
              <strong>Yo gestiono los datos, usted controla el resultado.</strong>
            </p>
          </div>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-bold">API Key</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-white/60 text-sm">Tu clave de acceso privada</Label>
                <div className="flex gap-2 mt-1">
                  <Input 
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    readOnly
                    className="bg-white/10 border-white/20 text-white font-mono"
                  />
                  <Button 
                    onClick={() => setShowKey(!showKey)}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button 
                    onClick={() => copyToClipboard(apiKey, 'API Key')}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-white/60 text-sm">Endpoint Base</Label>
                <div className="flex gap-2 mt-1">
                  <Input 
                    value={endpoint}
                    readOnly
                    className="bg-white/10 border-white/20 text-white font-mono"
                  />
                  <Button 
                    onClick={() => copyToClipboard(endpoint, 'Endpoint')}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-bold">Ejemplo de Código</h3>
            </div>
            
            <div className="bg-black/50 rounded-lg p-4 border border-white/10 relative">
              <Button 
                onClick={() => copyToClipboard(exampleCode, 'Código de ejemplo')}
                className="absolute top-2 right-2 bg-cyan-600 hover:bg-cyan-700 text-white"
                size="sm"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copiar
              </Button>
              <pre className="text-cyan-400 text-sm overflow-x-auto font-mono">
                {exampleCode}
              </pre>
            </div>
          </div>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-bold">Ejemplo para Python</h3>
            </div>
            
            <div className="bg-black/50 rounded-lg p-4 border border-white/10 relative">
              <Button 
                onClick={() => copyToClipboard(pythonExample, 'Ejemplo para Python')}
                className="absolute top-2 right-2 bg-cyan-600 hover:bg-cyan-700 text-white"
                size="sm"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copiar
              </Button>
              <pre className="text-cyan-400 text-sm overflow-x-auto font-mono">
                {pythonExample}
              </pre>
            </div>
          </div>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-bold">Ejemplo para Power BI</h3>
            </div>
            
            <div className="bg-black/50 rounded-lg p-4 border border-white/10 relative">
              <Button 
                onClick={() => copyToClipboard(powerBIExample, 'Ejemplo para Power BI')}
                className="absolute top-2 right-2 bg-cyan-600 hover:bg-cyan-700 text-white"
                size="sm"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copiar
              </Button>
              <pre className="text-cyan-400 text-sm overflow-x-auto font-mono">
                {powerBIExample}
              </pre>
            </div>
          </div>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <div className="p-6">
            <h3 className="text-white font-bold mb-4">Endpoints Disponibles</h3>
            <div className="space-y-3">
              {[
                { method: 'GET', path: '/executive-dashboard', desc: 'Obtener métricas ejecutivas (gauges)' },
                { method: 'GET', path: '/financial-impact', desc: 'Análisis de impacto financiero' },
                { method: 'GET', path: '/branch-risk', desc: 'Mapa de riesgo por sucursal' },
                { method: 'GET', path: '/compliance-history', desc: 'Historial de cumplimiento' },
                { method: 'GET', path: '/assets-health', desc: 'Estado de activos críticos' }
              ].map((endpoint, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <Badge className={`${endpoint.method === 'GET' ? 'bg-green-600' : 'bg-blue-600'} text-white border-0`}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-cyan-400 text-sm font-mono">{endpoint.path}</code>
                  </div>
                  <span className="text-white/60 text-sm hidden md:block">{endpoint.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Ejemplo de Respuesta JSON */}
        <Card className="bg-white/5 border-white/10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-cyan-400" />
                <h3 className="text-white font-bold">Ejemplo de Respuesta JSON</h3>
              </div>
              <Button 
                onClick={() => copyToClipboard(JSON.stringify({
                  compliance: 92,
                  assets: 78,
                  training: 85,
                  financialSavings: 30300000,
                  inspections: 248,
                  workers: 1247,
                  branches: 15,
                  incidents: 3,
                  timestamp: '2026-01-26T10:30:00Z'
                }, null, 2), 'Respuesta JSON')}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                size="sm"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copiar
              </Button>
            </div>
            
            <div className="bg-black/50 rounded-lg p-4 border border-white/10">
              <pre className="text-emerald-400 text-sm overflow-x-auto font-mono">
{`{
  "compliance": 92,
  "assets": 78,
  "training": 85,
  "financialSavings": 30300000,
  "inspections": 248,
  "workers": 1247,
  "branches": 15,
  "incidents": 3,
  "timestamp": "2026-01-26T10:30:00Z"
}`}
              </pre>
            </div>
            <p className="text-white/60 text-xs mt-3">
              💡 <strong>Tip:</strong> Los datos se actualizan en tiempo real. Perfecto para dashboards que necesitan información al minuto.
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-900/40 to-green-900/40 border-emerald-500/30">
          <div className="p-6">
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-bold mb-2">Ventajas del Modelo API</h3>
                <ul className="text-white/80 text-sm space-y-2">
                  <li><strong>• Sticky Product:</strong> Una vez que la empresa programa su sistema para leer tu API, es difícil cambiar de proveedor.</li>
                  <li><strong>• Transparencia Total:</strong> El gerente siente que tiene control completo sin hacer el trabajo sucio.</li>
                  <li><strong>• Innovación 4.0:</strong> Te posicionas como un profesional muy por encima del promedio en Chile.</li>
                  <li><strong>• Integración Nativa:</strong> SAP, PowerBI, Intranets corporativas - todos compatibles.</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Documentación Completa
          </Button>
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            Regenerar API Key
          </Button>
        </div>
      </div>
    </div>
  );
}