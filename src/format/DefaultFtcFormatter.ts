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
    const flowElement = node.getFlowElement() as Flow.FlowElement;

    switch (node.getStatement()) { // Any better way to identify "special" nodes?
      case 'try':
        return this.formatTryStatement();
      case 'DEFAULT':
        return this.formatDefaultOutcome();
      case 'except':
        return this.formatExceptStatement();
    }

    if (!flowElement) {
      return 'No flow element for the node';
    }

    switch (true) {
      case Flow.isFlowActionCall(flowElement):
        return this.formatActionCall(flowElement);
      case Flow.isFlowDecision(flowElement):
        return this.formatDecision(flowElement);
      case Flow.isFlowSubflow(flowElement):
        return this.formatSubflow(flowElement);
      case Flow.isFlowRule(flowElement):
        return this.formatRule(flowElement);
      case Flow.isFlowAssignment(flowElement):
        return this.formatAssignment(flowElement);
      case Flow.isFlowScreen(flowElement):
        return this.formatFlowScreen(flowElement);
      case Flow.isFlowLoop(flowElement):
        return this.formatLoop(flowElement);
      default:
        return flowElement.name;
    }
  }

  private formatLoop(element: Flow.FlowLoop): string {
    return `LOOP: ${element.name}`;
  }

  private formatExceptStatement(): string {
    return 'except:';
  }

  private formatTryStatement(): string {
    return 'try:';
  }

  private formatFlowScreen(element: Flow.FlowScreen): string {
    return `SCREEN: ${element.name}`;
  }

  private formatDefaultOutcome(): string {
    return 'DEFAULT:';
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