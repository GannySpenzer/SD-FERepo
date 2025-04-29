import ApiClient from "../Client/ApiClient";
import { client } from "../Client/Client";
import {
  IDisconnectionPayload,
  ISourceConnection,
} from "../Interface/ConnectorInterface.js";

const API = {
  getSourceConnection: async (sourceConnection: any): Promise<any> => {
    try {
      const baseUrl = process.env.REACT_APP_COMMON_API_BASE_URL;
      const token = localStorage.getItem("cid_t");
      const response = await ApiClient.request({
        method: "POST",
        url: `${baseUrl}/api/sourceConnection`,
        data: sourceConnection,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error testing source connection", error);
      throw error;
    }
  },

  deleteSourceConnection: async (
    payload: IDisconnectionPayload
  ): Promise<any> => {
    try {
      const baseUrl = process.env.REACT_APP_COMMON_API_BASE_URL;
      const token = localStorage.getItem("cid_t");
      const response = await ApiClient.request({
        method: "POST",
        url: `${baseUrl}/api/disconnectConnection`,
        data: payload,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Return the response data
    } catch (error) {
      console.error("Error deleting source connection", error);
      throw error;
    }
  },

  getTargetConnection: async (targetConnection: any): Promise<any> => {
    try {
      const baseUrl = process.env.REACT_APP_COMMON_API_BASE_URL;
      const token = localStorage.getItem("cid_t");
      const response = await ApiClient.request({
        method: "POST",
        url: `${baseUrl}/api/targetConnection`,
        data: targetConnection,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error testing target connection", error);
      throw error;
    }
  },

  getAllApplication: async (payload: any): Promise<any> => {
    try {
      const baseUrl = process.env.REACT_APP_COMMON_API_BASE_URL;
      const token = localStorage.getItem("cid_t");
      const response = await ApiClient.request({
        method: "POST",
        url: `${baseUrl}/api/getAllApplication`,
        data: payload,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching all applications", error);
      throw error;
    }
  },
};

export { API };
