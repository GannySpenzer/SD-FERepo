import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
//PS_08-13,40-46,55-62,68-73 Handling the client request and response
const ApiClient = {
    request: async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
        try {
            const response = await axios(config);
            return response;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                // Custom error handling based on HTTP status code
                switch (error.response.status) {
                    case 400:
                        throw new Error('Bad Request');
                    case 401:
                        throw new Error('Unauthorized');
                    case 404:
                        throw new Error('Not Found');
                    case 500:
                        throw new Error('Internal Server Error');
                    case 405:
                        throw new Error('Method Not Supported');
                    default:
                        throw new Error(`Unexpected error: ${error.message}`);
                }
            } else {
                throw new Error('Network Error');
            }
        }
    }
};

export default ApiClient;