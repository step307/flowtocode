/* eslint-disable no-param-reassign */
import * as Flow from '../flow/Flow.js';

export class ParseTreeNode {
  private statement: string;
  private parent?: ParseTreeNode;
  private flowElement?: Flow.FlowBaseElement;
  private children: ParseTreeNode[];

  public constructor(statement?: string, flowElement?: Flow.FlowBaseElement) {
    this.statement = statement ? statement : '';
    this.flowElement = flowElement;
    this.children = [];
  }

  public getStatement(): string {
    return this.statement;
  }

  public setStatement(statement: string): void {
    this.statement = statement;
  }

  public getParent(): ParseTreeNode | undefined {
    return this.parent;
  }

  public setParent(parent: ParseTreeNode | undefined): void {
    this.parent = parent;
  }

  public getFlowElement(): Flow.FlowBaseElement | undefined {
    return this.flowElement;
  }

  public setFlowElement(flowElement: Flow.FlowBaseElement | undefined): void {
    this.flowElement = flowElement;
  }

  public getChildren(): ParseTreeNode[] {
    return this.children;
  }

  public addChild(child: ParseTreeNode): void {
    this.children.push(child);
    child.setParent(this);
  }
}

export class FlowParser {
  private flowElementByName: Map<string, Flow.FlowBaseElement>;

  public constructor() {
    this.flowElementByName = new Map<string, Flow.FlowBaseElement>();
  }

  public toPseudoCode(flow: Flow.Flow): string {
    const root = this.parse(flow);
    return this.convertToPseudocode(root);
  }

  public convertToPseudocode(node: ParseTreeNode, tabLevel: number = -1): string {
    let result = '';
    if (node.getStatement()) {
      result += `${'  '.repeat(tabLevel)}${node.getStatement()}\n`;
    }
    for (const child of node.getChildren()) {
      result += this.convertToPseudocode(child, tabLevel + 1);
    }
    return result;
  }

  public parse(flow: Flow.Flow): ParseTreeNode {
    this.flowElementByName = this.getFlowElementByName(flow);

    const startElement: Flow.FlowElement = this.getElementFromConnector(flow.start.connector);

    if (startElement) {
      const root = new ParseTreeNode();
      this.parseElement(root, startElement);
      return root;
    } else {
      throw new Error('No start element found');
    }
  }

  private parseElement(parentNode: ParseTreeNode, element: Flow.FlowElement): void {
    if (parentNode.getFlowElement() === element) {
      return;
    } else if (Flow.isFlowActionCall(element)) {
      this.parseActionCallElement(parentNode, element);
    } else if (Flow.isFlowScreen(element)) {
      this.parseScreenElement(parentNode, element);
    } else if (Flow.isFlowLoop(element)) {
      this.parseLoopElement(parentNode, element);
    } else if (Flow.isFlowAssignment(element)) {
      parentNode.addChild(new ParseTreeNode('ASSIGNMENT: ' + element.name, element));
      this.parseConnector(parentNode, element);
    } else {
      parentNode.addChild(new ParseTreeNode(element.name, element));
      this.parseConnector(parentNode, element);
    }
  }

  private parseActionCallElement(parentNode: ParseTreeNode, actionElement: Flow.FlowActionCall): void {
    const faultConnectorElement =
      actionElement.faultConnector != null ? this.getElementFromConnector(actionElement.faultConnector) : null;
    if (faultConnectorElement && parentNode.getFlowElement() !== faultConnectorElement) {
      // try references fault connector to avoid infinite recursion on above check
      const tryNode = new ParseTreeNode('try:', faultConnectorElement);
      parentNode.addChild(tryNode);
      this.parseElement(tryNode, actionElement);

      const catchNode = new ParseTreeNode('except:');
      parentNode.addChild(catchNode);
      this.parseElement(catchNode, faultConnectorElement);
    } else {
      parentNode.addChild(new ParseTreeNode('APEX CALL: ' + actionElement.name, actionElement));
      this.parseConnector(parentNode, actionElement);
    }
  }

  private parseScreenElement(parentNode: ParseTreeNode, screenElement: Flow.FlowScreen): void {
    parentNode.addChild(new ParseTreeNode('SCREEN: ' + screenElement.name, screenElement));
    this.parseConnector(parentNode, screenElement);
  }

  private parseLoopElement(parentNode: ParseTreeNode, flowElement: Flow.FlowLoop): void {
    const loopNode = new ParseTreeNode('LOOP: ' + flowElement.name, flowElement);
    parentNode.addChild(loopNode);
    const nextValueElement = this.getElementFromConnector(flowElement.nextValueConnector);
    if (nextValueElement) {
      this.parseElement(loopNode, nextValueElement);
    }
    const noMoreValuesElement = this.getElementFromConnector(flowElement.noMoreValuesConnector);
    if (noMoreValuesElement) {
      this.parseElement(parentNode, noMoreValuesElement);
    }
  }

  private parseConnector(parentNode: ParseTreeNode, element: Flow.FlowElement): void {
    if ('connector' in element) {
      const child = this.getElementFromConnector(element.connector as Flow.FlowConnector);
      if (child) {
        this.parseElement(parentNode, child);
      }
    }
  }

  private getElementFromConnector(connector: Flow.FlowConnector): Flow.FlowElement {
    if (!this.flowElementByName.has(connector.targetReference)) {
      throw new Error(`No element found with name ${connector.targetReference}`);
    } else {
      return this.flowElementByName.get(connector.targetReference) as Flow.FlowElement;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private getFlowElementByName(flow: Flow.Flow): Map<string, Flow.FlowBaseElement> {
    const apiToFlowNode = new Map<string, Flow.FlowBaseElement>();
    if (flow.actionCalls) {
      if (!Array.isArray(flow.actionCalls)) {
        flow.actionCalls = [flow.actionCalls];
      }
      for (const action of flow.actionCalls) {
        apiToFlowNode.set(action.name, action);
      }
    }
    if (flow.screens) {
      if (!Array.isArray(flow.screens)) {
        flow.screens = [flow.screens];
      }
      for (const screen of flow.screens) {
        apiToFlowNode.set(screen.name, screen);
      }
    }
    if (flow.loops) {
      if (!Array.isArray(flow.loops)) {
        flow.loops = [flow.loops];
      }
      for (const loop of flow.loops) {
        apiToFlowNode.set(loop.name, loop);
      }
    }
    if (flow.assignments) {
      if (!Array.isArray(flow.assignments)) {
        flow.assignments = [flow.assignments];
      }
      for (const assignment of flow.assignments) {
        apiToFlowNode.set(assignment.name, assignment);
      }
    }
    return apiToFlowNode;
  }
}
