import { FormatterInterface } from '../parse/FlowParser.js';
import * as Flow from '../flow/Flow.js';

export class DefaultFtcFormatter implements FormatterInterface {
  public formatAssignement(element: Flow.FlowAssignment): string {
    return `ASSIGNMENT: ${element.name}`;
  }
}