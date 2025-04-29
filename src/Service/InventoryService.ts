import ApiClient from '../Client/ApiClient';
//PS_05-07,14-16,54,63-65 the getInventory fservice is for handling the request to sent to ythe clients.
export const getInventory = async (payload: any): Promise<any> => {
    try {
        const baseUrl = process.env.REACT_APP_INVENTORY_API_BASE_URL;
        // Retrieve the token from local storage
        const token = localStorage.getItem('cid_t');
        
        // If there is no token, you should handle it accordingly
        if (!token) {
            throw new Error('No token found');
        }

        const response = await ApiClient.request({
            method: 'POST',
            url: `${baseUrl}/api/getInventory`,
            data: payload,
            headers: {
                'Content-Type': 'application/json',
                // Include the retrieved token in the Authorization header
                Authorization: `Bearer ${token}`
            }
        });
        return response.data; // Return the response data directly
    } catch (error) {
        throw error; // Throw the error to be handled by the calling function
    }
};
//PS_38,39,46,47 - The getInventoryStatus function for getting the inventory status whether it is statred or completed
export const getInventoryStatus = async (payload: any): Promise<any> => {
    try {
        const baseUrl = process.env.REACT_APP_INVENTORY_API_BASE_URL; // Retrieve base URL from environment variables
        const token = localStorage.getItem('cid_t'); // Retrieve the token from local storage

        // If there is no token, handle it accordingly
        if (!token) {
            throw new Error('No token found');
        }

        const response = await ApiClient.request({
            method: 'POST',
            url: `${baseUrl}/api/startInventory`, // Use the base URL for the request
            data: payload,
            headers: {
                'Content-Type': 'application/json', // Set content type
                Authorization: `Bearer ${token}` // Include the retrieved token in the Authorization header
            }
        });
        return response; // Return the response data directly
    } catch (error) {
        throw error; // Throw the error to be handled by the calling function
    }
};
//PS_66,67,74-76 - The getFullInventoryDetails is for handling the export details
export const getFullInventoryDetails = async (payload: any): Promise<any> => {
    try {
        const baseUrl = process.env.REACT_APP_INVENTORY_API_BASE_URL;
        // Retrieve the token from local storage
        const token = localStorage.getItem('cid_t');
        
        // If there is no token, you should handle it accordingly
        if (!token) {
            throw new Error('No token found');
        }

        const response = await ApiClient.request({
            method: 'POST', 
            url: `${baseUrl}/api/export`, 
            data: payload, 
            headers: {
                'Content-Type': 'application/json',
                
                Authorization: `Bearer ${token}`
            },
            
        });
        return response.data; 
    } catch (error) {
        throw error; 
    }
}

export const getWizardStatus = async (taskId: any): Promise<any> => {
    try {
        const baseUrl = process.env.REACT_APP_INVENTORY_API_BASE_URL; // Retrieve base URL from environment variables
        const token = localStorage.getItem('cid_t'); // Retrieve the token from local storage

        // If there is no token, handle it accordingly
        if (!token) {
            throw new Error('No token found');
        }

        const response = await ApiClient.request({
            method: 'POST',  
            url: `${baseUrl}/api/getWizardStatus`, 
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


