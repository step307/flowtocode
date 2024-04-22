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
