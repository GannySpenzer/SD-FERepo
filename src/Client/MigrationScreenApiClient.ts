import axios, { AxiosRequestConfig } from 'axios';

export class APIClient {

    private getRequestConfig(): AxiosRequestConfig {
        return {
            headers: {
                Authorization: 'Bearer some-token',  // Replace with actual token retrieval logic
                'Content-Type': 'application/json'
            }
        };
    }

    async get(url: string) {
        const config = this.getRequestConfig();
        return axios.get(url, config);
    }

    async post(url: string, data: any) {
        const config = this.getRequestConfig();
        return axios.post(url, data, config);
    }

    // Handle response and error handling logic if needed
}

