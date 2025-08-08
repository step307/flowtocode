import prettier from 'prettier';
import { ParseTreeNode, NodeType } from '../parse/FlowParser.js';
import * as Flow from '../flow/Flow.js';
import { FormatterInterface } from '../commands/ftc/generate/code.js';
import { FlowAssignmentItem } from '../flow/Flow.js';

export class JsFormatter implements FormatterInterface {
  private functions: Map<string, string> = new Map<string, string>();

  public convertToPseudocode(node: ParseTreeNode): Promise<string> {
      let result = '';
      result += 'function main() {\n';
      result += this.formatNodeChildren(node);
      result += '\n}';

      const functions = Array.from(this.functions.entries())
        .map(([name, body]) => `function ${name}() {\n${body}\n}`).join('');

      return prettier.format(functions + '\n\n' + result, {parser: 'babel'});
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
        return `${flowElement.name}();`;
    }
  }

  private formatAlreadyVisited(element: Flow.FlowElement): string {
    return `${element.name}();`; // TODO: should be a proper function call
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
    return `catch (e) {\n${this.formatNodeChildren(node)}\n}`;
  }

  private formatTryStatement(node: ParseTreeNode): string {
    return `try {\n${this.formatNodeChildren(node)}\n}`;
  }

  private formatFlowScreen(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowScreen;
    // this.functions.set(element.name, `// Show ${element.label} ${element.description ?? ''}`);
    return `${element.name}(); // Show ${element.label}${this.formatNodeChildren(node)}`;
  }

  private formatDefaultOutcome(node: ParseTreeNode): string {
    return `else {\n${this.formatNodeChildren(node)}\n}`;
  }
    
  private formatAssignment(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowAssignment;
    this.functions.set(element.name, this.formatAssignments(element.assignmentItems ?? []));
    return `${element.name}();${this.formatNodeChildren(node)}`;
  }

  private formatAssignments(assignmentItems: FlowAssignmentItem[]): string {
    return Array.isArray(assignmentItems) 
      ? assignmentItems.map((item: FlowAssignmentItem) => 
        `${item.assignToReference}${this.formatAssignOperator(item.operator)}${JSON.stringify(item.value)};`
      ).join('')
      : '';
  }

  private formatAssignOperator(operator: string): string {
    switch (operator) {
      case 'Add':
        return ' += ';
      case 'Subtract':
        return ' -= ';
      case 'AddItem':
        return '[]= ';
      case 'Assign':
        return ' = ';
      default:
        return operator;
    }
  } 

  private formatSubflow(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowSubflow;
    return `call_${element.name}(); // ${element.flowName}${this.formatNodeChildren(node)}`;
  }

  private formatDecision(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowDecision;
    return `// ${element.label}. ${element.description ?? ''}\n${this.formatNodeChildren(node)}`;
  }

  private formatRule(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowRule;
    return `/* ?else */ if (true /* ${element.conditionLogic} : ${JSON.stringify(element.conditions)} */) { // ${element.label} ${element.description ?? ''}
    ${this.formatNodeChildren(node)}
    }`;
  }

  private formatActionCall(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowActionCall;
    return `do_${element.name}(); // ${element.label}${this.formatNodeChildren(node)}`;
  }
}