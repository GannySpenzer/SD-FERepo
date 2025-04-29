export interface ISourceConnection {
  sourceUrl: string;
  sourceApiKey: string;
  sourceValue: string;
  applicationId: number | null;
  organizationId: number | null;
  connectionId: number | null;
}

export interface IApplication {
  find: any;
  application_id: number;
  application_name: string;
  is_active: boolean;
  is_source: boolean;
  is_target: boolean;
}

export interface IDisconnectionPayload {
  connectionId: number | null;
  applicationId: number | null;
}

export interface ITargetConnection {
  targetValue: string;
  targetUrl: string;
  targetApiKey: string;
  targetUserName: string;
  applicationId: number | null; // Allow applicationId to be null
  connectionId: number | null; // Allow connectionId to be null
  organizationId: number | null;
}
