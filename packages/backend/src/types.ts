export type SupabaseInstance = {
  projectRef: string;
  projectUrl: string;
  anonKey?: string;
  anonKeyRole?: string;
  serviceRoleLeak?: {
    sourceRequestId: string;
    location: string;
  };
  tables: Record<string, TableState>;
  rpcs: string[];
  buckets: string[];
  bucketStates?: Record<string, BucketState>;
  rpcStates?: Record<string, RpcState>;
  schemaStates?: Record<string, SchemaState>;
  firstSeenRequestId: string;
  inScope: boolean;
  detectionFindingRaised?: boolean; // true once the "instance detected" finding exists
  sessions?: SessionUser[]; // authenticated users available for this instance
  activeSessionId?: string; // which session is active; undefined = anonymous
};

export type SessionUser = {
  id: string;
  email: string;
  token: string; // access_token (JWT)
  source: "signup" | "signin" | "manual";
  createdAt: string;
};

export type TableState = {
  name: string;
  observed: boolean;
  anonRead?: "rows" | "empty" | "denied" | "untested";
  rowCount?: number;
  anonWrite?: "accepted" | "rejected" | "untested";
  columns?: string[];
  sampleRow?: string; // JSON of the single row fetched during the read check (limit=1)
  idor?: IdorResult; // per-identity differential read result
  evidenceRequestIds: string[];
};

export type IdorResult = {
  perUser: Array<{ label: string; rowCount: number; sampleId?: string }>;
  shared: boolean; // two distinct users see identical rows -> RLS not scoping per-user
};

export type StorageObject = {
  path: string; // full object path within the bucket (incl. folders)
  size?: number;
  mimetype?: string;
};

export type BucketState = {
  name: string;
  fileCount: number;
  files: StorageObject[]; // sampled list of objects found (capped)
};

export type RpcState = {
  name: string;
  status?: number;
  exposed: boolean; // callable without auth (200/204)
};

export type SchemaSensitivity = "critical" | "high" | "medium";

export type SchemaState = {
  name: string;
  exposed: boolean; // reachable by the tested role via Accept-Profile
  sensitivity: SchemaSensitivity;
  status?: number;
  testedAs: string; // identity label used (anon / email)
};

export type ActivityEntry = {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  statusCode?: number;
  note?: string;
};

export type PluginSettings = {
  maxRequestsPerSecond: number;
  maxConcurrency: number;
  redactEvidence: boolean;
  testEmail: string;
  tableWordlist: string; // newline/comma-separated table names for read checks
  useCustomWordlist: boolean; // true = use tableWordlist; false = built-in default list
  discoveryEnabled: boolean; // when false, checks only test observed tables (no brute-force)
};

export type JwtPayload = {
  role?: string;
  sub?: string;
  iss?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
};

export type CheckProgress = {
  projectRef: string;
  message: string;
};

export type ProbeResult = {
  success: boolean;
  statusCode?: number;
  body?: string;
  requestId?: string;
  error?: string;
};
