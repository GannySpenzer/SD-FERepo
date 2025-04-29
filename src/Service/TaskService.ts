import ApiClient from "../Client/ApiClient";
import { PayloadData, TaskItem, TaskGridResponse } from "../Common/Interface";



export const getTaskGridData = async (payloadData: PayloadData): Promise<TaskGridResponse> => {
    try {
        const baseUrl = process.env.REACT_APP_COMMON_API_BASE_URL;
        // Retrieve the token from local storage
        const token = localStorage.getItem('cid_t');
        
        // If there is no token, you should handle it accordingly
        if (!token) {
            throw new Error('No token found');
        }
        
        const response = await ApiClient.request({
            method: 'POST',
            url: `${baseUrl}/api/tasks`,
            data: payloadData,
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
  
  
export const createMigrationTask = async (migrationData: any): Promise<any> => {
    try {
      const baseUrl = process.env.REACT_APP_COMMON_API_BASE_URL;
      
      // Retrieve the token from local storage
      const token = localStorage.getItem('cid_t')
      
    //   If there is no token, you should handle it accordingly
      if (!token) {
        throw new Error('No token found');
      }
  
      const response = await ApiClient.request({
        method: 'POST',
        url: `${baseUrl}/api/saveTasks`,
        data: { taskName: migrationData },
        headers: {
          'Content-Type': 'application/json',
          // Include the retrieved token in the Authorization header
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Return the response data directly
    } catch (error) {
      throw error; // Throw the error to be handled by the calling function
    }
  };