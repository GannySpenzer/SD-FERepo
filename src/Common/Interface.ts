import { imageLinks } from "./Constant";

//#region  Login Interface
export interface LoginResponse {
    message: string;
}
export interface LoginRequest {
    email: string;
    isAdmin: boolean;
}

//#endregion

//#region Popups Interfaces
export interface AlertPopupProps {
    title: string;
    message: string;
    onClose: () => void;
  }

//#endregion


export interface TaskItem {
    task_id: number;
    title: string;
    status: string;
    source: keyof typeof imageLinks; // Use keyof to restrict to valid keys in imageLinks
    target: keyof typeof imageLinks; // Same as above
    inventory_date: string; // or Date if you're parsing it
    last_activity: string;
    activity : string;
    migration_start_date: string; // or Date if you're parsing it
}

export interface TaskGridResponse {
    task_details: TaskItem[];
    total_count: number;
}
export interface LocalFilter {
    inventoryDateFrom: string;
    inventoryDateTo: string;
    migrationStartDateFrom: string;
    migrationStartDateTo: string;
    status: string[]; // Explicitly define 'status' as an array of strings
  }

export interface Filter {
    inventoryDateFrom: string;
    inventoryDateTo: string;
    migrationStartDateFrom: string;
    migrationStartDateTo: string;
    status: number[]; // Array of numbers corresponding to the statuses
  }
  
  // Define the PayloadData interface to structure the payloadData object
 export interface PayloadData {
    searchTitle: string;
    sortColumn: string;
    sortOrder: 'asc' | 'desc' | string; // The sortOrder can only be 'asc' or 'desc'
    pagination: number;
    filter: Filter; // Nested Filter interface
  }

  export interface InventoryCounts {
    userCount: any;
    ticketCount: number;
    kbCount: number;
    attachmentCount: number;
    attachmentSize: number;
    solutionCount: number;
    problemCount: number;
    incidentCount: number;
    changeCount: number;
    userPercentage: number;
    ticketPercentage: number;
    kbPercentage: number;
    solutionPercentage: number;
    problemPercentage: number;
    incidentPercentage: number;
    changePercentage: number;
  }

  export interface SummaryPayload {
    taskId: number;
  }