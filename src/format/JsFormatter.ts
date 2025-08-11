import prettier from 'prettier';
import { ParseTreeNode, NodeType, RootNode } from '../parse/FlowParser.js';
import * as Flow from '../flow/Flow.js';
import { FormatterInterface } from '../commands/ftc/generate/code.js';
import { FlowAssignmentItem } from '../flow/Flow.js';

export class JsFormatter implements FormatterInterface {
  private functions: Map<string, string> = new Map<string, string>();
  private revisitedElements: string[] = [];

  public convertToPseudocode(node: ParseTreeNode): Promise<string> {
    
    let result = '';
    let variables: Flow.FlowVariable[] = [];

    this.revisitedElements = this.filterNodes(node, n => n.getType() === NodeType.ALREADY_VISITED)
    .map(n => n.getFlowElement()?.name ?? '');

    if (node.getType() === NodeType.ROOT) {
      variables = (node as RootNode).flow.variables ?? [];
    }

    result += 'function main('
     + variables.filter(v => v.isInput).map(v => `${v.name}: ${v.dataType}`).join(', ')
     + ') {\n'
     + variables.filter(v => !v.isInput).map(v => `  let ${v.name}: ${v.dataType} = ${v.value ? this.formatFlowElementReferenceOrValue(v.value) : 'null'};`).join('\n')
     + '\n\n'
     + this.formatNodeChildren(node)
     + 'return [' + variables.filter(v => v.isOutput).map(v => v.name).join(', ') + '];'
     + '\n}';

    // Functions may be only collected after the formating round, as they are "pitched" from the traverse
    const functions = Array.from(this.functions.entries())
      .map(([name, body]) => `function ${name}() {\n${body}\n}`).join('');
    
    return prettier.format(functions + '\n\n' + result, {parser: 'babel-ts'});
  }

  private formatNodeChildren(node: ParseTreeNode): string {
    return node.getChildren().map(child => this.formatNode(child)).join('\n');
  }

  private filterNodes(node: ParseTreeNode, callback: (node: ParseTreeNode) => boolean): ParseTreeNode[] {
      const results: ParseTreeNode[] = [];
      
      const traverse = (currentNode: ParseTreeNode): void => {
        if (callback(currentNode)) {
          results.push(currentNode);
        }
        
        for (const child of currentNode.getChildren()) {
          traverse(child);
        }
      };
  
      traverse(node);
      return results;
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
        return this.formatAssignmentNode(node);
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

  private formatNodeChain(node: ParseTreeNode, nodeOwnBody: string): string {
    if (node.getFlowElement() === null || node.getFlowElement() === undefined) {
      return nodeOwnBody;
    }
    
    const element = node.getFlowElement() as Flow.FlowElement;

    // Revisited nodes should be encapsulated as functions to call them from multiple places of the tree
    if (this.revisitedElements.includes(element.name)) {
      this.functions.set(element.name, nodeOwnBody + this.formatNodeChildren(node));
      return `${element.name}()\n`;
    }

    return nodeOwnBody;
  }

  private formatAlreadyVisited(element: Flow.FlowElement): string {
    return `${element.name}();`;
  }

  private formatLoop(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowLoop;
    const body = `
    // ${element.label}
    for (let ${element.name} of ${element.collectionReference} /*${element.iterationOrder}*/)
      {
        ${this.formatNodeChildren(node)}
      }
    `;
    return this.formatNodeChain(node, body);
  }

  private formatExceptStatement(node: ParseTreeNode): string {
    return `catch (e) {\n${this.formatNodeChildren(node)}\n}`;
  }

  private formatTryStatement(node: ParseTreeNode): string {
    return `try {\n${this.formatNodeChildren(node)}\n}`;
  }

  private formatFlowScreen(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowScreen;
    return this.formatNodeChain(node, `${element.name}.show(); // Show ${element.label} ${element.description ?? ''}`);
  }

  private formatDefaultOutcome(node: ParseTreeNode): string {
    return `else {\n${this.formatNodeChildren(node)}\n}`;
  }
    
  private formatAssignmentNode(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowAssignment;
    return this.formatNodeChain(node, `// ${element.label}\n${this.formatAssignments(element.assignmentItems ?? [])}`);
  }

  private formatAssignments(assignmentItems: FlowAssignmentItem[]): string {
    const items = Array.isArray(assignmentItems) ? assignmentItems : [assignmentItems];

    return items.map((item: FlowAssignmentItem) =>
      `${item.assignToReference}${this.formatAssignOperator(item.operator)}${this.formatFlowElementReferenceOrValue(item.value)};`
    ).join('');
  }

  private formatFlowElementReferenceOrValue(value: Flow.FlowElementReferenceOrValue): string {
    if (value.elementReference !== undefined) {
      return value.elementReference;  
    } else {
      return JSON.stringify(value);
    }
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
    return this.formatNodeChain(node, `// Call subflow ${element.flowName}$`);
  }

  private formatDecision(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowDecision;
    return this.formatNodeChain(node, `// ${element.label}. ${element.description ?? ''}`);
  }

  private formatRule(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowRule;
    return `/* ?else */ if (true /* ${element.conditionLogic} : ${JSON.stringify(element.conditions)} */) { // ${element.label} ${element.description ?? ''}
    ${this.formatNodeChildren(node)}
    }`;
  }

  private formatActionCall(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowActionCall;
    const params = Array.isArray(element.inputParameters) ? element.inputParameters : [element.inputParameters];
    const body = `${element.actionType}.${element.actionName}({
      ${params.map(param => param.name + ': ' + this.formatFlowElementReferenceOrValue(param.value)).join(', ')}
    });`;
    return this.formatNodeChain(node, body);
  }
}