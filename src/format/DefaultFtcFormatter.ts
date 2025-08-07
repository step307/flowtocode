import { ParseTreeNode } from '../parse/FlowParser.js';
import * as Flow from '../flow/Flow.js';
import { FormatterInterface } from '../commands/ftc/generate/code.js';

export class DefaultFtcFormatter implements FormatterInterface {
  public convertToPseudocode(node: ParseTreeNode, tabLevel: number = -1): string {
      let result = '';
      if (node.getType()) {
        result += `${'  '.repeat(tabLevel)}${this.formatNodeStatement(node)}\n`;
      }
      for (const child of node.getChildren()) {
        result += this.convertToPseudocode(child, tabLevel + 1);
      }
      return result;
  }

  private formatNodeStatement(node: ParseTreeNode): string {
    const flowElement = node.getFlowElement() as Flow.FlowElement;

    switch (node.getType()) {
      case 'try':
        return this.formatTryStatement();
      case 'DEFAULT':
        return this.formatDefaultOutcome();
      case 'except':
        return this.formatExceptStatement();
      case 'ACTION_CALL':
        return this.formatActionCall(flowElement as Flow.FlowActionCall);
      case 'DECISION':
        return this.formatDecision(flowElement as Flow.FlowDecision);
      case 'SUBFLOW':
        return this.formatSubflow(flowElement as Flow.FlowSubflow);
      case 'CASE':
        return this.formatRule(flowElement as Flow.FlowRule);
      case 'ASSIGNMENT':
        return this.formatAssignment(flowElement as Flow.FlowAssignment);
      case 'SCREEN':
        return this.formatFlowScreen(flowElement as Flow.FlowScreen);
      case 'LOOP':
        return this.formatLoop(flowElement as Flow.FlowLoop);
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