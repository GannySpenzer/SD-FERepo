import axios, { Method } from "axios";

export async function client(endpoint: string, body: any, requestType: Method) {
  try {
    const url = `${process.env.REACT_APP_BASE_URL}/${endpoint}`

    const requestConfig = {
      method: requestType,
      url: url,
      data: body,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await axios(requestConfig);

    return response;

  } catch (error: any) {

    return error;
  }
}