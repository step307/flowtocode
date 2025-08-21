import { ParseTreeNode, NodeType } from '../parse/FlowParser.js';
import * as Flow from '../flow/Flow.js';
import { FormatterInterface } from '../commands/ftc/generate/code.js';

export class DefaultFtcFormatter implements FormatterInterface {
  public convertToPseudocode(node: ParseTreeNode, tabLevel: number = -1): string {
      let result = '';
      if (node.getType() !== NodeType.ROOT) {
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
      case NodeType.TRY:
        return this.formatTryStatement();
      case NodeType.DEFAULT_OUTCOME:
        return this.formatDefaultOutcome();
      case NodeType.EXCEPT:
        return this.formatExceptStatement();
      case NodeType.ACTION_CALL:
        return this.formatActionCall(flowElement as Flow.FlowActionCall);
      case NodeType.DECISION:
        return this.formatDecision(flowElement as Flow.FlowDecision);
      case NodeType.SUBFLOW:
        return this.formatSubflow(flowElement as Flow.FlowSubflow);
      case NodeType.CASE:
        return this.formatRule(flowElement as Flow.FlowRule);
      case NodeType.ASSIGNMENT:
        return this.formatAssignment(flowElement as Flow.FlowAssignment);
      case NodeType.SCREEN:
        return this.formatFlowScreen(flowElement as Flow.FlowScreen);
      case NodeType.LOOP:
        return this.formatLoop(flowElement as Flow.FlowLoop);
      case NodeType.ALREADY_VISITED:
        return this.formatAlreadyVisited(flowElement);
      default:
        return flowElement.name;
    }
  }

  private formatAlreadyVisited(element: Flow.FlowElement): string {
    return `ALREADY OUTPUT: ${element.name}`;
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