const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface Make {
    makeId: number;
    makeName: string;
}

export interface MakeModel {
    modelId: number;
    makeId: number;
    modelName: string;
}

export interface Body {
    bodyId: number;
    bodyName: string;
}

export interface DriveType {
    driveTypeId: number;
    driveTypeName: string;
}

export interface VehicleDetail {
    id: number;
    makeName: string;
    modelName: string;
    bodyName: string;
    driveTypeName: string;
    vehicleDisplayName: string;
    year: number;
    engine: string;
    engineCc: number;
    engineCylinders: number;
    engineLiterDisplay: number;
    numDoors: number;
}

export const fetchMakes = async (): Promise<Make[]> => {
    const response = await fetch(`${API_BASE_URL}/makes/`);
    if (!response.ok) {
        throw new Error('Failed to fetch makes');
    }
    return response.json();
};

export const fetchModels = async (makeId?: number): Promise<MakeModel[]> => {
    const url = makeId ? `${API_BASE_URL}/models/?make_id=${makeId}` : `${API_BASE_URL}/models/`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch models');
    }
    return response.json();
};

export const fetchBodies = async (): Promise<Body[]> => {
    const response = await fetch(`${API_BASE_URL}/bodies/`);
    if (!response.ok) {
        throw new Error('Failed to fetch bodies');
    }
    return response.json();
};

export const fetchDriveTypes = async (): Promise<DriveType[]> => {
    const response = await fetch(`${API_BASE_URL}/drivetypes/`);
    if (!response.ok) {
        throw new Error('Failed to fetch drive types');
    }
    return response.json();
};

export const fetchVehicles = async (filters: { makeId?: number; modelId?: number; year?: number }): Promise<VehicleDetail[]> => {
    const params = new URLSearchParams();
    if (filters.makeId) params.append('make_id', filters.makeId.toString());
    if (filters.modelId) params.append('model_id', filters.modelId.toString());
    if (filters.year) params.append('year', filters.year.toString());

    const response = await fetch(`${API_BASE_URL}/vehicles/?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
    }
    return response.json();
};
