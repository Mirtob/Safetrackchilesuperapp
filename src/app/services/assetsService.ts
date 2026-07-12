import { supabase } from './supabase';

export interface MaintenanceRecord {
  date: string;
  type: 'preventivo' | 'correctivo' | 'predictivo';
  description: string;
  technician: string;
  cost: number;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  type: string;
  category: 'maquinaria' | 'herramienta' | 'equipo' | 'vehiculo' | 'instalacion';
  brand: string;
  model: string;
  serialNumber: string;
  sector: string;
  location: string;
  acquisitionDate: string;
  acquisitionCost: number;
  status: 'operativo' | 'mantenimiento' | 'fuera-servicio' | 'baja';
  condition: 'excelente' | 'bueno' | 'regular' | 'malo';
  responsible: string;
  nextInspectionDate: string;
  lastInspectionDate: string;
  inspectionFrequency: 'semanal' | 'quincenal' | 'mensual' | 'trimestral' | 'semestral' | 'anual';
  maintenanceHistory: MaintenanceRecord[];
  documents: string[];
  notes: string;
  alertCount: number;
}

type AssetInput = Omit<Asset, 'id' | 'maintenanceHistory' | 'documents' | 'alertCount'>;

const CATEGORIES: Asset['category'][] = ['maquinaria', 'herramienta', 'equipo', 'vehiculo', 'instalacion'];
const STATUSES: Asset['status'][] = ['operativo', 'mantenimiento', 'fuera-servicio', 'baja'];
const CONDITIONS: Asset['condition'][] = ['excelente', 'bueno', 'regular', 'malo'];
const FREQUENCIES: Asset['inspectionFrequency'][] = ['semanal', 'quincenal', 'mensual', 'trimestral', 'semestral', 'anual'];

const mapAsset = (row: any): Asset => ({
  id: row.id,
  code: row.code,
  name: row.name,
  type: row.asset_type || '',
  category: (CATEGORIES.includes(row.category) ? row.category : 'equipo') as Asset['category'],
  brand: row.brand || '',
  model: row.model || '',
  serialNumber: row.serial_number || '',
  sector: row.sector || '',
  location: row.location || '',
  acquisitionDate: row.acquisition_date || '',
  acquisitionCost: row.acquisition_cost != null ? Number(row.acquisition_cost) : 0,
  status: (STATUSES.includes(row.status) ? row.status : 'operativo') as Asset['status'],
  condition: (CONDITIONS.includes(row.condition) ? row.condition : 'bueno') as Asset['condition'],
  responsible: row.responsible || '',
  nextInspectionDate: row.next_inspection_date || '',
  lastInspectionDate: row.last_inspection_date || '',
  inspectionFrequency: (FREQUENCIES.includes(row.inspection_frequency) ? row.inspection_frequency : 'mensual') as Asset['inspectionFrequency'],
  maintenanceHistory: [],
  documents: [],
  notes: row.notes || '',
  alertCount: 0,
});

const toRow = (asset: AssetInput) => ({
  code: asset.code,
  name: asset.name,
  asset_type: asset.type || null,
  category: asset.category,
  brand: asset.brand || null,
  model: asset.model || null,
  serial_number: asset.serialNumber || null,
  sector: asset.sector || null,
  location: asset.location || null,
  acquisition_date: asset.acquisitionDate || null,
  acquisition_cost: asset.acquisitionCost || null,
  status: asset.status,
  condition: asset.condition,
  responsible: asset.responsible || null,
  next_inspection_date: asset.nextInspectionDate || null,
  last_inspection_date: asset.lastInspectionDate || null,
  inspection_frequency: asset.inspectionFrequency,
  notes: asset.notes || null,
});

export const fetchAssetsByCompany = async (companyId: string): Promise<Asset[]> => {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('company_id', companyId)
    .order('name');

  if (error) throw error;
  return (data || []).map(mapAsset);
};

export const fetchAssetById = async (assetId: string): Promise<Asset | null> => {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('id', assetId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapAsset(data) : null;
};

export const createAsset = async (companyId: string, asset: AssetInput): Promise<Asset> => {
  const { data, error } = await supabase
    .from('assets')
    .insert({ company_id: companyId, ...toRow(asset) })
    .select()
    .single();

  if (error) throw error;
  return mapAsset(data);
};

export const updateAsset = async (assetId: string, asset: AssetInput): Promise<Asset> => {
  const { data, error } = await supabase
    .from('assets')
    .update(toRow(asset))
    .eq('id', assetId)
    .select()
    .single();

  if (error) throw error;
  return mapAsset(data);
};

export const deleteAsset = async (assetId: string): Promise<void> => {
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', assetId);
  if (error) throw error;
};
