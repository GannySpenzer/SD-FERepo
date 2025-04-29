export interface MigrationState {
  invalidFileUrl: string | undefined;
  uploadFile: string;
  migrationPercentage: number;
  uploadedFileName?: string;
  excelData?: any[];
  errors?: { file?: string };
  isInProgress: boolean;
  isCompleted: boolean;
  migrationStarted: boolean;
}


export interface MigrationPayload {
  taskId: number;
  isFullInventory: boolean;
  isCriteriaBasedMigration: boolean;
  criteriaBasedCheckboxes: string[];
  isTicket: boolean;
  isKnowledgeBase: boolean;
  fromDate: string;
  toDate: string;
  uploadFileName: string;
  excelData: any[];
  errorMessage?: string;
  migrationPercentage: number
  ticketResult: {
    source: number,
    target: number,
    failed: number,
  },
  knowledgeBaseResult: {
    source: number,
    target: number,
    failed: number,
  },
  migrationStatus: string,
  sourceConnectionAppName: String,
  targetConnectionAppName: string,
  migrationStartDate: string, 
  migrationEndDate: string,
  taskName: string,
}