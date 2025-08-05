import { FormatterInterface } from '../parse/FlowParser.js';
import * as Flow from '../flow/Flow.js';

export class DefaultFtcFormatter implements FormatterInterface {
  public formatAssignment(element: Flow.FlowAssignment): string {
    return `ASSIGNMENT: ${element.name}`;
  }

  public formatSubflow(element: Flow.FlowSubflow): string {
    return `SUBFLOW: ${element.name}`;
  }
  
  public formatDecision(element: Flow.FlowDecision): string {
    return `DECISION: ${element.name}`;
  }
  
  public formatRule(element: Flow.FlowRule): string {
    return `CASE: ${element.label}`;
  }

  public formatActionCall(element: Flow.FlowActionCall): string {
    return `ACTION CALL: ${element.name}`;
  }
}