import { ParseTreeNode } from '../parse/FlowParser.js';
import * as Flow from '../flow/Flow.js';
import { FormatterInterface } from '../commands/ftc/generate/code.js';

export class DefaultFtcFormatter implements FormatterInterface {
  public convertToPseudocode(node: ParseTreeNode, tabLevel: number = -1): string {
      let result = '';
      if (node.getStatement()) {
        result += `${'  '.repeat(tabLevel)}${this.formatNodeStatement(node)}\n`;
      }
      for (const child of node.getChildren()) {
        result += this.convertToPseudocode(child, tabLevel + 1);
      }
      return result;
  }

  private formatNodeStatement(node: ParseTreeNode): string {
    const flowElement = node.getFlowElement();

    if (flowElement === undefined) {
      return node.getStatement() ? node.getStatement() : ''; // TODO: remove this fallback
    }

    if (Flow.isFlowActionCall(flowElement)) {
      return this.formatActionCall(flowElement);
    } else if (Flow.isFlowDecision(flowElement)) {
      return this.formatDecision(flowElement);
    } else if (Flow.isFlowSubflow(flowElement)) {
      return this.formatSubflow(flowElement);
    } else if (Flow.isFlowRule(flowElement)) {
      return this.formatRule(flowElement);
    } else if (Flow.isFlowAssignment(flowElement)) {
      return this.formatAssignment(flowElement);
    }

    return node.getStatement() ? node.getStatement() : ''; // TODO: remove this fallback
  }
    
  private formatAssignment(element: Flow.FlowAssignment): string {
    return `ASSIGNMENT: ${element.name}`;
  }

  private formatSubflow(element: Flow.FlowSubflow): string {
    return `SUBFLOW: ${element.name}`;
  }

  private formatDecision(element: Flow.FlowDecision): string {
    return `DECISION: ${element.name}`;
  }

  private formatRule(element: Flow.FlowRule): string {
    return `CASE: ${element.label}`;
  }

  private formatActionCall(element: Flow.FlowActionCall): string {
    return `ACTION CALL: ${element.name}`;
  }
}