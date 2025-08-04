import { FormatterInterface } from '../parse/FlowParser.js';
import * as Flow from '../flow/Flow.js';

export class DefaultFtcFormatter implements FormatterInterface {
  public formatAssignment(element: Flow.FlowAssignment): string {
    return `ASSIGNMENT: ${element.name}`;
  }

  public formatSubflow(element: Flow.FlowSubflow): string {
    return `SUBFLOW: ${element.name}`;
  }
}