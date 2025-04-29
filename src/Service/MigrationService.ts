import ApiClient from '../Client/ApiClient';

export const pageLoadMigration = async (taskId: any): Promise<any> => {
    try {
        const baseUrl = process.env.REACT_APP_MIGRATION_API_BASE_URL;
        const token = localStorage.getItem('cid_t');
        
        if (!token) {
            throw new Error('No token found');
        }
        
        const response = await ApiClient.request({
            method: 'POST',
            url: `${baseUrl}/api/pageLoadMigration`,
            data:{"task_id":Number(taskId)},
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const successMigrationReport = async (taskId: any): Promise<any> => {
    try {
        const baseUrl = process.env.REACT_APP_MIGRATION_API_BASE_URL;
        const token = localStorage.getItem('cid_t');
        
        if (!token) {
            throw new Error('No token found');
        }
        
        const response = await ApiClient.request({
            method: 'POST',
            url: `${baseUrl}/api/migrationSuccessReport`,
            data:{"taskId":Number(taskId)},
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const postStartMigration = async (payload: any): Promise<any> => {
    try {
        const baseUrl = process.env.REACT_APP_MIGRATION_API_BASE_URL;
        const token = localStorage.getItem('cid_t');
        
        if (!token) {
            throw new Error('No token found');
        }
        
        const response = await ApiClient.request({
            method: 'POST',
            url: `${baseUrl}/api/startMigration`,
            data: payload,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        
        return response;
    } catch (error) {
        throw error;
    }
};


export const postStopMigration = async (taskId: any): Promise<any> => {
    try {
        const baseUrl = process.env.REACT_APP_MIGRATION_API_BASE_URL;
        const token = localStorage.getItem('cid_t');
        
        if (!token) {
            throw new Error('No token found');
        }
        
        const response = await ApiClient.request({
            method: 'POST',
            url: `${baseUrl}/api/stopMigration`,
            data: { taskId },
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        
        return response.data;
    } catch (error) {
        throw error;
    }
};

    
