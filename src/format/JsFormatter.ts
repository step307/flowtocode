import prettier from 'prettier';
import { ParseTreeNode, NodeType, RootNode } from '../parse/FlowParser.js';
import * as Flow from '../flow/Flow.js';
import { FormatterInterface } from '../commands/ftc/generate/code.js';
import { FlowAssignmentItem } from '../flow/Flow.js';

export class JsFormatter implements FormatterInterface {
  private functions: Map<string, string> = new Map<string, string>();
  private revisitedElements: string[] = [];

  public convertToPseudocode(node: ParseTreeNode): Promise<string> {
    let variables: Flow.FlowVariable[] = [];
    let flowName = 'main';
    let description = `/** ${node.getFlowElement()?.description ?? ''} **/`;

    this.revisitedElements = this.filterNodes(node, n => n.getType() === NodeType.ALREADY_VISITED)
    .map(n => n.getFlowElement()?.name ?? '');

    if (node.getType() === NodeType.ROOT) {
      const flow = (node as RootNode).flow;
      variables = flow.variables ?? [];
      flowName = flow.fullName ?? 'main';
      description = `/** 
      ${flow.label ? flow.label : ''}
      ${flow.description ?? ''} **/`;
    }

    const childrenCode = this.formatNodeChildren(node);
    // Functions may be only collected after the formating round, as they are "pitched" from the traverse
    // const functions = Array.from(this.functions.entries()).map(([name, body]) => `function ${name}() {\n${body}\n}`).join('');

    const result = `
    ${description}
    function ${flowName}(`
     + variables.filter(v => v.isInput).map(v => `${v.name}: ${v.dataType}`).join(', ')
     + ') {\n'
     + variables.filter(v => !v.isInput).map(v => `  let ${v.name}: ${v.dataType} = ${v.value ? this.formatFlowElementReferenceOrValue(v.value) : 'null'};`).join('\n')
     + '\n\n'
     // + functions
     + '\n\n'
     + childrenCode
     + 'return [' + variables.filter(v => v.isOutput).map(v => v.name).join(', ') + '];'
     + '\n}';
    // return Promise.resolve(result);
    return prettier.format(result, {parser: 'babel-ts', printWidth: 300});
  }

  private formatNodeChildren(node: ParseTreeNode): string {
    return node.getChildren().map((child, index) => this.formatNode(child, index)).join('\n');
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

  private formatNode(node: ParseTreeNode, sequenceNr: number = 0): string {
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
        return this.formatRule(node, sequenceNr);
      case NodeType.ASSIGNMENT:
        return this.formatAssignmentNode(node);
      case NodeType.SCREEN:
        return this.formatFlowScreen(node);
      case NodeType.LOOP:
        return this.formatLoop(node);
      case NodeType.ALREADY_VISITED:
        return this.formatAlreadyVisited(flowElement);
      default:
        return this.formatNodeChain(node, `${flowElement.name}(); // ${JSON.stringify(flowElement)}`);
    }
  }

  private formatNodeChain(node: ParseTreeNode, nodeOwnBody: string): string {
    if (node.getFlowElement() === null || node.getFlowElement() === undefined) {
      return nodeOwnBody;
    }
    
    const element = node.getFlowElement() as Flow.FlowElement;

    // Revisited nodes should be encapsulated as functions to call them from multiple places of the tree
    if (this.revisitedElements.includes(element.name)) {
      if (!this.functions.has(element.name)) {
        this.functions.set(element.name, nodeOwnBody);
      }
      return `// [lbl] ${element.name}:\n${nodeOwnBody} \n ${this.formatNodeChildren(node)}`;
    }

    return nodeOwnBody + '\n' + this.formatNodeChildren(node);
  }

  private formatAlreadyVisited(element: Flow.FlowElement): string {
    return `// goto ${element.name};`;
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
    return body;
  }

  private formatExceptStatement(node: ParseTreeNode): string {
    return `catch (e) {\n${this.formatNodeChildren(node)}\n}`; // TODO: should it call formatNodeChain?
  }

  private formatTryStatement(node: ParseTreeNode): string {
    return `try {\n${this.formatNodeChildren(node)}\n}`; // TODO: should it call formatNodeChain?
  }

  private formatFlowScreen(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowScreen;
    return this.formatNodeChain(node, `screen.show('${element.name}'); // Show ${element.label} ${element.description ?? ''}\n`);
  }

  private formatDefaultOutcome(node: ParseTreeNode): string {
    return `else {\n${this.formatNodeChildren(node)}\n}`; // TODO: should it call formatNodeChain?
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
    } else if (value.numberValue !== undefined && value.numberValue !== null) {
      return value.numberValue.toString();
    } else if (value.stringValue !== undefined && value.stringValue !== null) {
      return `"${value.stringValue ?? ''}"`;
    } else if (value.booleanValue !== undefined && value.booleanValue !== null) {
      return value.booleanValue.toString();
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
    return this.formatNodeChain(node, `subflow.call('${element.flowName}');\n`); // TODO: render parameters
  }

  private formatDecision(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowDecision;
    return this.formatNodeChain(node, `// Check: ${element.label}. ${element.description ?? ''}`);
  }

  private formatRule(node: ParseTreeNode, sequenceNr: number): string {
    const element = node.getFlowElement() as Flow.FlowRule;
    const conditions = Array.isArray(element.conditions) ? element.conditions : [element.conditions];

    let condition: string =
      element.conditionLogic === 'and' ? Array.from(conditions.keys()).map(key => key + 1).join(' AND ') :
      element.conditionLogic === 'or'  ? Array.from(conditions.keys()).map(key => key + 1).join(' OR ') :
      element.conditionLogic;

    for (const [index, flowCondition] of conditions.entries()) {
      condition = condition.replace(
        String(index + 1),
        this.formatCondition(flowCondition)
      );
    }

    return `${sequenceNr ? 'else' : ''} if (${condition}) { // Case: ${element.label} ${element.description ?? ''}
    ${this.formatNodeChildren(node)}
    }`;
  }

  private formatCondition(flowCondition: Flow.FlowCondition): string {
    if (flowCondition.operator === Flow.FlowComparisonOperator.EqualTo) {
      return `(${flowCondition.leftValueReference} === ${this.formatFlowElementReferenceOrValue(flowCondition.rightValue)})`;
    } else if (flowCondition.operator === Flow.FlowComparisonOperator.NotEqualTo) {
      return `(${flowCondition.leftValueReference} !== ${this.formatFlowElementReferenceOrValue(flowCondition.rightValue)})`;
    } else if (flowCondition.operator === Flow.FlowComparisonOperator.IsNull && flowCondition.rightValue.booleanValue !== null) {
      return `(${flowCondition.leftValueReference} ${flowCondition.rightValue.booleanValue ? '=' : '!'}== null)`;
    } else {
      return `${flowCondition.operator}(${flowCondition.leftValueReference}, ${this.formatFlowElementReferenceOrValue(flowCondition.rightValue)})`;
    }
  }

  private formatActionCall(node: ParseTreeNode): string {
    const element = node.getFlowElement() as Flow.FlowActionCall;
    const params = Array.isArray(element.inputParameters) ? element.inputParameters : [element.inputParameters];
    const body = `${element.actionType}.call('${element.actionName}', {
      ${params.map(param => param.name + ': ' + this.formatFlowElementReferenceOrValue(param.value)).join(', ')}
    }); // ${element.label} ${element.description ?? ''}`;
    return this.formatNodeChain(node, body);
  }
}