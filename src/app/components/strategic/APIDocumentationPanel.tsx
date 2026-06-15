import { useState } from 'react';
import { Code, Copy, Check, Key, FileCode, Shield, Zap, Database, ExternalLink } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

const API_ENDPOINTS = [
  {
    category: 'Autenticación',
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Autenticar usuario y obtener token JWT',
        params: [
          { name: 'email', type: 'string', required: true },
          { name: 'password', type: 'string', required: true }
        ],
        response: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: { id: 'user_123', email: 'prevencionista@empresa.cl', role: 'prevencionista' }
        }
      }
    ]
  },
  {
    category: 'Empresas',
    endpoints: [
      {
        method: 'GET',
        path: '/api/companies',
        description: 'Obtener lista de empresas del prevencionista',
        params: [],
        response: [
          { id: '1', name: 'Constructora Los Andes S.A.', rut: '76.123.456-7', workerCount: 245 }
        ]
      },
      {
        method: 'GET',
        path: '/api/companies/:id',
        description: 'Obtener detalles de una empresa específica',
        params: [{ name: 'id', type: 'string', required: true, in: 'path' }],
        response: {
          id: '1',
          name: 'Constructora Los Andes S.A.',
          branches: [{ id: 'B1-1', name: 'Obra Portal Ñuñoa' }]
        }
      }
    ]
  },
  {
    category: 'Geolocalización',
    endpoints: [
      {
        method: 'POST',
        path: '/api/time-tracking/checkin',
        description: 'Registrar entrada con geolocalización',
        params: [
          { name: 'companyId', type: 'string', required: true },
          { name: 'branchId', type: 'string', required: false },
          { name: 'latitude', type: 'number', required: true },
          { name: 'longitude', type: 'number', required: true },
          { name: 'accuracy', type: 'number', required: true }
        ],
        response: {
          id: 'T123',
          checkInTime: '2026-01-27T08:30:00Z',
          coordinates: { latitude: -33.4578, longitude: -70.6005 },
          verified: true
        }
      },
      {
        method: 'POST',
        path: '/api/time-tracking/checkout',
        description: 'Registrar salida con geolocalización',
        params: [
          { name: 'timeEntryId', type: 'string', required: true },
          { name: 'latitude', type: 'number', required: true },
          { name: 'longitude', type: 'number', required: true }
        ],
        response: {
          id: 'T123',
          checkOutTime: '2026-01-27T17:45:00Z',
          totalHours: 9.25,
          verified: true
        }
      }
    ]
  },
  {
    category: 'Gastos',
    endpoints: [
      {
        method: 'POST',
        path: '/api/expenses',
        description: 'Crear nuevo gasto',
        params: [
          { name: 'type', type: 'string', required: true },
          { name: 'amount', type: 'number', required: true },
          { name: 'description', type: 'string', required: true },
          { name: 'companyId', type: 'string', required: true },
          { name: 'receipt', type: 'file', required: false }
        ],
        response: {
          id: 'E123',
          status: 'pendiente',
          createdAt: '2026-01-27T10:30:00Z'
        }
      },
      {
        method: 'GET',
        path: '/api/expenses',
        description: 'Obtener lista de gastos',
        params: [
          { name: 'companyId', type: 'string', required: false },
          { name: 'status', type: 'string', required: false },
          { name: 'startDate', type: 'string', required: false },
          { name: 'endDate', type: 'string', required: false }
        ],
        response: [
          { id: 'E123', type: 'vehiculo', amount: 45000, status: 'aprobado' }
        ]
      }
    ]
  },
  {
    category: 'Incidentes',
    endpoints: [
      {
        method: 'POST',
        path: '/api/incidents',
        description: 'Reportar nuevo incidente/accidente',
        params: [
          { name: 'type', type: 'string', required: true },
          { name: 'severity', type: 'string', required: true },
          { name: 'description', type: 'string', required: true },
          { name: 'companyId', type: 'string', required: true },
          { name: 'location', type: 'object', required: true },
          { name: 'photos', type: 'array[file]', required: false }
        ],
        response: {
          id: 'INC123',
          status: 'reported',
          reportNumber: 'ACC-2026-001',
          createdAt: '2026-01-27T12:00:00Z'
        }
      }
    ]
  }
];

const CODE_EXAMPLES = {
  javascript: `// Ejemplo de integración con SafeTrack API
const API_BASE_URL = 'https://api.safetrack.cl/v1';
const API_KEY = 'tu_api_key_aqui';

// 1. Autenticación
async function login(email, password) {
  const response = await fetch(\`\${API_BASE_URL}/auth/login\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  return data.token;
}

// 2. Registrar check-in con GPS
async function checkIn(token, companyId, latitude, longitude) {
  const response = await fetch(\`\${API_BASE_URL}/time-tracking/checkin\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`,
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({
      companyId,
      latitude,
      longitude,
      accuracy: 10
    })
  });
  
  return await response.json();
}

// 3. Obtener gastos
async function getExpenses(token, companyId) {
  const response = await fetch(
    \`\${API_BASE_URL}/expenses?companyId=\${companyId}\`,
    {
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'X-API-Key': API_KEY
      }
    }
  );
  
  return await response.json();
}`,

  python: `# Ejemplo de integración con SafeTrack API en Python
import requests
from typing import Dict, List

API_BASE_URL = 'https://api.safetrack.cl/v1'
API_KEY = 'tu_api_key_aqui'

class SafeTrackClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.token = None
        self.headers = {
            'Content-Type': 'application/json',
            'X-API-Key': api_key
        }
    
    def login(self, email: str, password: str) -> str:
        """Autenticar y obtener token"""
        response = requests.post(
            f'{API_BASE_URL}/auth/login',
            headers=self.headers,
            json={'email': email, 'password': password}
        )
        data = response.json()
        self.token = data['token']
        self.headers['Authorization'] = f'Bearer {self.token}'
        return self.token
    
    def check_in(self, company_id: str, latitude: float, longitude: float) -> Dict:
        """Registrar entrada con GPS"""
        response = requests.post(
            f'{API_BASE_URL}/time-tracking/checkin',
            headers=self.headers,
            json={
                'companyId': company_id,
                'latitude': latitude,
                'longitude': longitude,
                'accuracy': 10
            }
        )
        return response.json()
    
    def get_expenses(self, company_id: str = None) -> List[Dict]:
        """Obtener lista de gastos"""
        params = {'companyId': company_id} if company_id else {}
        response = requests.get(
            f'{API_BASE_URL}/expenses',
            headers=self.headers,
            params=params
        )
        return response.json()

# Uso
client = SafeTrackClient(API_KEY)
client.login('prevencionista@empresa.cl', 'password')
expenses = client.get_expenses('company_123')`,

  curl: `# Ejemplos con cURL

# 1. Login
curl -X POST https://api.safetrack.cl/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: tu_api_key_aqui" \\
  -d '{
    "email": "prevencionista@empresa.cl",
    "password": "tu_password"
  }'

# 2. Check-in con GPS
curl -X POST https://api.safetrack.cl/v1/time-tracking/checkin \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer tu_token_jwt" \\
  -H "X-API-Key: tu_api_key_aqui" \\
  -d '{
    "companyId": "1",
    "latitude": -33.4578,
    "longitude": -70.6005,
    "accuracy": 10
  }'

# 3. Obtener gastos
curl -X GET "https://api.safetrack.cl/v1/expenses?companyId=1" \\
  -H "Authorization: Bearer tu_token_jwt" \\
  -H "X-API-Key: tu_api_key_aqui"

# 4. Crear nuevo gasto
curl -X POST https://api.safetrack.cl/v1/expenses \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer tu_token_jwt" \\
  -H "X-API-Key: tu_api_key_aqui" \\
  -d '{
    "type": "vehiculo",
    "amount": 45000,
    "description": "Traslado a obra",
    "companyId": "1"
  }'`
};

export function APIDocumentationPanel() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'POST':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Documentación API SafeTrack
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          API RESTful para integración con sistemas externos
        </p>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
          <div className="p-6">
            <Zap className="w-8 h-8 mb-4 opacity-80" />
            <div className="text-2xl font-bold mb-1">REST API</div>
            <p className="text-blue-100 text-sm">JSON sobre HTTPS</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
          <div className="p-6">
            <Shield className="w-8 h-8 mb-4 opacity-80" />
            <div className="text-2xl font-bold mb-1">OAuth 2.0</div>
            <p className="text-green-100 text-sm">Autenticación segura</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white">
          <div className="p-6">
            <Database className="w-8 h-8 mb-4 opacity-80" />
            <div className="text-2xl font-bold mb-1">Real-time</div>
            <p className="text-purple-100 text-sm">Webhooks y SSE</p>
          </div>
        </Card>
      </div>

      {/* API Key */}
      <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-[#FF8C00]" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              API Key
            </h3>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-lg font-mono text-sm flex items-center justify-between">
            <code className="text-zinc-900 dark:text-white">
              sk_live_51JqL8KH3mK9Xz7Y4pN2wQ1vR6tS8uA3bC5dE7fG9hJ0kL2mN4oP6qR8sT0uV2wX4yZ6
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard('sk_live_51JqL8KH3mK9Xz7Y4pN2wQ1vR6tS8uA3bC5dE7fG9hJ0kL2mN4oP6qR8sT0uV2wX4yZ6', 'api-key')}
            >
              {copiedCode === 'api-key' ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            ⚠️ Mantén tu API key segura. No la compartas públicamente.
          </p>
        </div>
      </Card>

      {/* Tabs de contenido */}
      <Tabs defaultValue="endpoints" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="examples">Ejemplos de Código</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          {API_ENDPOINTS.map((category, catIndex) => (
            <Card key={catIndex} className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                  {category.category}
                </h3>
                <div className="space-y-4">
                  {category.endpoints.map((endpoint, endIndex) => (
                    <div
                      key={endIndex}
                      className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <Badge className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <code className="flex-1 text-sm font-mono text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded">
                          {endpoint.path}
                        </code>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                        {endpoint.description}
                      </p>
                      
                      {endpoint.params.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                            Parámetros:
                          </p>
                          <div className="space-y-1">
                            {endpoint.params.map((param, paramIndex) => (
                              <div
                                key={paramIndex}
                                className="flex items-center gap-2 text-xs"
                              >
                                <code className="text-[#0055A4] dark:text-blue-400">
                                  {param.name}
                                </code>
                                <Badge variant="outline" className="text-xs">
                                  {param.type}
                                </Badge>
                                {param.required && (
                                  <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                                    requerido
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                          Respuesta ejemplo:
                        </p>
                        <pre className="bg-zinc-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                          {JSON.stringify(endpoint.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Tabs defaultValue="javascript">
            <TabsList>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>

            {Object.entries(CODE_EXAMPLES).map(([lang, code]) => (
              <TabsContent key={lang} value={lang}>
                <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-5 h-5 text-[#0055A4]" />
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                          Ejemplo en {lang === 'javascript' ? 'JavaScript' : lang === 'python' ? 'Python' : 'cURL'}
                        </h3>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(code, lang)}
                      >
                        {copiedCode === lang ? (
                          <>
                            <Check className="w-4 h-4 mr-2 text-green-600" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="bg-zinc-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{code}</code>
                    </pre>
                  </div>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Enlaces útiles */}
      <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            Enlaces Útiles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a
              href="#"
              className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
            >
              <Code className="w-5 h-5 text-[#0055A4]" />
              <span className="flex-1 text-zinc-900 dark:text-white">
                Documentación completa
              </span>
              <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-[#0055A4]" />
            </a>
            <a
              href="#"
              className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
            >
              <Shield className="w-5 h-5 text-[#0055A4]" />
              <span className="flex-1 text-zinc-900 dark:text-white">
                Guía de seguridad
              </span>
              <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-[#0055A4]" />
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
