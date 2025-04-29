import ApiClient from '../Client/ApiClient';
import { LoginRequest, LoginResponse } from '../Common/Interface';



export const getloginDetails = async (payload: LoginRequest): Promise<LoginResponse> => {
    try {
        const baseUrl = process.env.REACT_APP_COMMON_API_BASE_URL;
        const response = await ApiClient.request({
            method: 'POST',
            url: `${baseUrl}/api/login`,
            data: payload,
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};