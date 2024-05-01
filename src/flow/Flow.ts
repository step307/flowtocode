// =====================================================================================================================
// Base Flow Types
// =====================================================================================================================

export type Metadata = {
  fullName: string;
};

export type Flow = Metadata & {
  actionCalls?: FlowActionCall[];
  apiVersion?: number;
  assignments?: FlowAssignment[];
  description?: string;
  interviewLabel?: string;
  isAdditionalPermissionRequiredToRun?: boolean;
  isTemplate?: boolean;
  label?: string;
  loops?: FlowLoop[];
  migratedFromWorkflowRuleName?: string;
  screens?: FlowScreen[];
  decisions?: FlowDecision[];
  recordLookups?: FlowRecordLookup[];
  recordRollbacks?: FlowRecordRollback[];
  recordCreates?: FlowRecordCreate[];
  recordUpdates?: FlowRecordUpdate[];
  recordDeletes?: FlowRecordDelete[];
  segment?: string;
  start: FlowStart;
  startElementReference?: string;
  steps?: FlowStep[];
  timeZoneSidKey?: string;
  triggerOrder?: number;
};
export function isFlow(obj: unknown): obj is Flow {
  return typeof obj === 'object' && obj !== null && 'description' in obj;
}

export type FlowBaseElement = object;

export type FlowElement = {
  description: string;
  name: string;
};

export type FlowNode = FlowElement & {
  elementSubtype: string;
  label: string;
};

// =====================================================================================================================
// Connector Flow Types
// =====================================================================================================================

export type FlowDecision = FlowNode & {
  defaultConnector: FlowConnector;
  defaultConnectorLabel: string;
  rules: FlowRule[];
};
export function isFlowDecision(obj: unknown): obj is FlowDecision {
  return typeof obj === 'object' && obj !== null && 'rules' in obj && 'defaultConnector' in obj;
}

export type FlowRule = FlowElement & {
  conditionLogic: string;
  conditions: FlowCondition[];
  connector: FlowConnector;
  doesRequireRecordChangedToMeetCriteria: boolean;
  label: string;
};

export type FlowActionCall = FlowNode & {
  actionName: string;
  actionType: string;
  connector: FlowConnector;
  faultConnector: FlowConnector;
};
export function isFlowActionCall(obj: unknown): obj is FlowActionCall {
  return typeof obj === 'object' && obj !== null && 'actionName' in obj;
}

export type FlowLoop = FlowNode & {
  assignNextValueToReference?: string;
  collectionReference: string;
  iterationOrder: 'Asc' | 'Desc';
  nextValueConnector: FlowConnector;
  noMoreValuesConnector: FlowConnector;
};
export function isFlowLoop(obj: unknown): obj is FlowLoop {
  return typeof obj === 'object' && obj !== null && 'nextValueConnector' in obj;
}

export type FlowScreen = FlowNode & {
  showHeader: boolean;
  connector: FlowConnector;
};
export function isFlowScreen(obj: unknown): obj is FlowScreen {
  return typeof obj === 'object' && obj !== null && 'showHeader' in obj;
}

export type FlowStart = FlowNode & {
  connector: FlowConnector;
  flowRunAsUser: string;
};

export type FlowStep = FlowNode & {
  connectors: FlowStep[];
};

export type FlowAssignment = FlowNode & {
  assignmentItems: FlowAssignmentItem[];
  connector: FlowConnector;
};

export function isFlowAssignment(obj: unknown): obj is FlowAssignment {
  return typeof obj === 'object' && obj !== null && 'assignmentItems' in obj;
}

export type FlowRecordLookup = FlowNode & {
  connector: FlowConnector;
  faultConnector: FlowConnector;
};

export type FlowRecordRollback = FlowNode & {
  connector: FlowConnector;
};

export type FlowRecordCreate = FlowNode & {
  connector: FlowConnector;
  faultConnector: FlowConnector;
};

export type FlowRecordUpdate = FlowNode & {
  connector: FlowConnector;
  faultConnector: FlowConnector;
};

export type FlowRecordDelete = FlowNode & {
  connector: FlowConnector;
  faultConnector: FlowConnector;
};

// =====================================================================================================================
// Other Flow Types
// =====================================================================================================================

export type FlowCondition = FlowBaseElement & {
  conditionType: FlowWaitConditionType;
  leftValueReference: string;
  operator: FlowComparisonOperator;
  rightValue: FlowElementReferenceOrValue;
};

export type FlowAssignmentItem = FlowBaseElement & {
  assignToReference: string;
  operator: FlowAssignmentOperator;
  value: FlowElementReferenceOrValue;
};

export type FlowConnector = FlowBaseElement & {
  targetReference: string;
  isGoTo: boolean;
};

export type FlowElementReferenceOrValue = {
  apexValue?: string;
  booleanValue?: boolean;
  dateTimeValue?: string;
  dateValue?: string;
  elementReference?: string;
  formulaDataType?: FlowDataType;
  formulaExpression?: string;
  numberValue?: number;
  setupReference?: string;
  setupReferenceType?: string;
  sobjectValue?: string;
  stringValue?: string;
};

// =====================================================================================================================
// Flow Enums
// =====================================================================================================================

export enum FlowAssignmentOperator {
  Add = 'Add',
  AddAtStart = 'AddAtStart',
  AddItem = 'AddItem',
  Assign = 'Assign',
  AssignCount = 'AssignCount',
  RemoveAfterFirst = 'RemoveAfterFirst',
  RemoveAll = 'RemoveAll',
  RemoveBeforeFirst = 'RemoveBeforeFirst',
  RemoveFirst = 'RemoveFirst',
  RemovePosition = 'RemovePosition',
  RemoveUncommon = 'RemoveUncommon',
  Subtract = 'Subtract',
}

export enum FlowDataType {
  Boolean = 'Boolean',
  Currency = 'Currency',
  Date = 'Date',
  DateTime = 'DateTime',
  Number = 'Number',
  String = 'String',
}

export enum FlowWaitConditionType {
  EntryCondition = 'EntryCondition',
  ExitCondition = 'ExitCondition',
}

export enum FlowComparisonOperator {
  Contains = 'Contains',
  EndsWith = 'EndsWith',
  EqualTo = 'EqualTo',
  GreaterThan = 'GreaterThan',
  GreaterThanOrEqualTo = 'GreaterThanOrEqualTo',
  In = 'In',
  IsChanged = 'IsChanged',
  IsNull = 'IsNull',
  LessThan = 'LessThan',
  LessThanOrEqualTo = 'LessThanOrEqualTo',
  None = 'None',
  NotEqualTo = 'NotEqualTo',
  NotIn = 'NotIn',
  StartsWith = 'StartsWith',
  WasSelected = 'WasSelected',
  WasSet = 'WasSet',
  WasVisited = 'WasVisited',
}
