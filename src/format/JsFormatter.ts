import { ParseTreeNode, NodeType } from '../parse/FlowParser.js';
import * as Flow from '../flow/Flow.js';
import { FormatterInterface } from '../commands/ftc/generate/code.js';

export class JsFormatter implements FormatterInterface {
  public convertToPseudocode(node: ParseTreeNode): string {
      let result = '';
      result += 'main() {\n';
      result += this.formatNodeChildren(node);
      result += '\n}';
      return result;
  }

  private formatNodeChildren(node: ParseTreeNode): string {
    return node.getChildren().map(child => this.formatNode(child)).join('\n');
  }

  private formatNode(node: ParseTreeNode): string {
    const flowElement = node.getFlowElement() as Flow.FlowElement;

    switch (node.getType()) {
      case NodeType.TRY:
        return this.formatTryStatement(node);
      case NodeType.DEFAULT_OUTCOME:
        return this.formatDefaultOutcome(node);
      case NodeType.EXCEPT:
        return this.formatExceptStatement(node);
      case NodeType.ACTION_CALL:
        return this.formatActionCall(node);
      case NodeType.DECISION:
        return this.formatDecision(node);
      case NodeType.SUBFLOW:
        return this.formatSubflow(node);
      case NodeType.CASE:
        return this.formatRule(node);
      case NodeType.ASSIGNMENT:
        return this.formatAssignment(node);
      case NodeType.SCREEN:
        return this.formatFlowScreen(node);
      case NodeType.LOOP:
        return this.formatLoop(node);
      case NodeType.ALREADY_VISITED:
        return this.formatAlreadyVisited(flowElement);
      default:
        return flowElement.name;
    }
  }

  private formatAlreadyVisited(element: Flow.FlowElement): string {
    return `GO TO ${element.name}`; // TODO: should be a proper function call
  }

  private formatLoop(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowLoop;
    return `foreach (${element.collectionReference} /*${element.iterationOrder}*/)
      {
        ${this.formatNodeChildren(node)}
      }
    `;
  }

  private formatExceptStatement(node: ParseTreeNode): string {
    return 'catch {\n' + this.formatNodeChildren(node) + '\n}';
  }

  private formatTryStatement(node: ParseTreeNode): string {
    return 'try {\n' + this.formatNodeChildren(node) + '\n}';
  }

  private formatFlowScreen(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowScreen;
    return `show_${element.name}(); // ${element.label}\n${this.formatNodeChildren(node)}`;
  }

  private formatDefaultOutcome(node: ParseTreeNode): string {
    return 'else {\n' + this.formatNodeChildren(node) + '\n}';
  }
    
  private formatAssignment(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowAssignment;
    return `ASSIGNMENT: ${element.name};${this.formatNodeChildren(node)}`;
  }

  private formatSubflow(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowSubflow;
    return `call_${element.name}(); // ${element.flowName}\n${this.formatNodeChildren(node)}`;
  }

  private formatDecision(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowDecision;
    return `// ${element.label}. ${element.description ?? ''}\n${this.formatNodeChildren(node)}`;
  }

  private formatRule(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowRule;
    return `(?else)if (${element.conditionLogic} : ${JSON.stringify(element.conditions)}) { // ${element.label} ${element.description ?? ''}
    ${this.formatNodeChildren(node)}
    }`;
  }

  private formatActionCall(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowActionCall;
    return `do_${element.name}(); // ${element.label}\n${this.formatNodeChildren(node)}`;
  }
}