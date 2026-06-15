import { Company } from '@/app/context/CompanyContext';

export const MOCK_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'Constructora Los Andes S.A.',
    rut: '76.123.456-7',
    address: 'Av. Vicuña Mackenna 4860, La Florida, Santiago',
    coordinates: {
      latitude: -33.5229,
      longitude: -70.5933
    },
    industry: 'Construcción',
    riskLevel: 'Alto',
    workerCount: 245,
    contractStart: '2023-01-15',
    contactPerson: 'Roberto Sánchez',
    phone: '+56 2 2345 6789',
    email: 'contacto@losandes.cl',
    branches: [
      {
        id: 'B1-1',
        name: 'Obra Portal Ñuñoa',
        address: 'Av. Irarrázaval 3456, Ñuñoa, Santiago',
        coordinates: {
          latitude: -33.4578,
          longitude: -70.6005
        },
        contactPerson: 'Mario Fuentes',
        phone: '+56 9 8765 4321',
        workerCount: 78
      },
      {
        id: 'B1-2',
        name: 'Obra Edificio Apoquindo',
        address: 'Av. Apoquindo 7800, Las Condes, Santiago',
        coordinates: {
          latitude: -33.4011,
          longitude: -70.5589
        },
        contactPerson: 'Claudia Morales',
        phone: '+56 9 7654 3210',
        workerCount: 92
      },
      {
        id: 'B1-3',
        name: 'Bodega Central Maipú',
        address: 'Av. Pajaritos 1234, Maipú, Santiago',
        coordinates: {
          latitude: -33.5077,
          longitude: -70.7689
        },
        contactPerson: 'Jorge Castro',
        phone: '+56 9 6543 2109',
        workerCount: 45
      }
    ]
  },
  {
    id: '2',
    name: 'Minera Atacama Norte',
    rut: '88.765.432-1',
    address: 'Ruta 5 Norte Km 1520, Antofagasta',
    coordinates: {
      latitude: -23.6509,
      longitude: -70.3975
    },
    industry: 'Minería',
    riskLevel: 'Alto',
    workerCount: 520,
    contractStart: '2022-06-01',
    contactPerson: 'Patricia González',
    phone: '+56 55 2234 5678',
    email: 'seguridad@mineraatacama.cl',
    branches: [
      {
        id: 'B2-1',
        name: 'Faena Mina Esperanza',
        address: 'Sector Sierra Gorda, Antofagasta',
        coordinates: {
          latitude: -22.8906,
          longitude: -69.3256
        },
        contactPerson: 'Luis Vargas',
        phone: '+56 9 5432 1098',
        workerCount: 340
      },
      {
        id: 'B2-2',
        name: 'Planta de Procesos',
        address: 'Parque Industrial Norte, Antofagasta',
        coordinates: {
          latitude: -23.5750,
          longitude: -70.3689
        },
        contactPerson: 'Andrea Pérez',
        phone: '+56 9 4321 0987',
        workerCount: 180
      }
    ]
  },
  {
    id: '3',
    name: 'Transportes y Logística Cruz del Sur',
    rut: '77.654.321-9',
    address: 'Ruta 68 Km 15, Pudahuel, Santiago',
    coordinates: {
      latitude: -33.4003,
      longitude: -70.7829
    },
    industry: 'Transporte y Logística',
    riskLevel: 'Medio',
    workerCount: 380,
    contractStart: '2023-03-10',
    contactPerson: 'Fernando Rojas',
    phone: '+56 2 2876 5432',
    email: 'prevencion@cruzdelsur.cl',
    branches: [
      {
        id: 'B3-1',
        name: 'Centro de Distribución Quilicura',
        address: 'Av. Américo Vespucio 1455, Quilicura',
        coordinates: {
          latitude: -33.3569,
          longitude: -70.7311
        },
        contactPerson: 'Marcela Silva',
        phone: '+56 9 3210 9876',
        workerCount: 95
      },
      {
        id: 'B3-2',
        name: 'Terminal de Carga Maipú',
        address: 'Camino a Melipilla 8900, Maipú',
        coordinates: {
          latitude: -33.5234,
          longitude: -70.8456
        },
        contactPerson: 'Ricardo Muñoz',
        phone: '+56 9 2109 8765',
        workerCount: 72
      }
    ]
  },
  {
    id: '4',
    name: 'Forestal Bio-Bio Ltda.',
    rut: '79.987.654-3',
    address: 'Ruta Q-61, Los Ángeles, Región del Biobío',
    coordinates: {
      latitude: -37.4697,
      longitude: -72.3542
    },
    industry: 'Forestal',
    riskLevel: 'Alto',
    workerCount: 195,
    contractStart: '2023-08-20',
    contactPerson: 'Hernán Espinoza',
    phone: '+56 43 2456 7890',
    email: 'hsec@forestalbiobio.cl',
    branches: [
      {
        id: 'B4-1',
        name: 'Aserradero Mulchén',
        address: 'Km 12 Camino a Mulchén, Biobío',
        coordinates: {
          latitude: -37.7189,
          longitude: -72.2395
        },
        contactPerson: 'Gonzalo Parra',
        phone: '+56 9 1098 7654',
        workerCount: 68
      },
      {
        id: 'B4-2',
        name: 'Faena Bosque Sur',
        address: 'Sector Quilleco, Biobío',
        coordinates: {
          latitude: -37.4833,
          longitude: -71.9667
        },
        contactPerson: 'Camila Bravo',
        phone: '+56 9 0987 6543',
        workerCount: 52
      }
    ]
  }
];
