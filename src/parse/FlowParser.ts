/* eslint-disable no-param-reassign */
import * as Flow from '../flow/Flow.js';

export type ParseTreeNode = {
  statement: string;
  parent?: ParseTreeNode;
  flowElement?: Flow.FlowBaseElement;
  children: ParseTreeNode[];
};

export class FlowParser {
  private flowElementByName: Map<string, Flow.FlowBaseElement> | undefined;

  public toPseudoCode(flow: Flow.Flow): string {
    const root = this.parse(flow);
    return this.convertToPseudocode(root);
  }

  public convertToPseudocode(node: ParseTreeNode, tabLevel: number = -1): string {
    let result = '';
    if (node.statement) {
      result += `${'  '.repeat(tabLevel)}${node.statement}\n`;
    }
    for (const child of node.children) {
      result += this.convertToPseudocode(child, tabLevel + 1);
    }
    return result;
  }

  public parse(flow: Flow.Flow): ParseTreeNode {
    this.flowElementByName = this.getFlowElementByName(flow);

    const startElement: Flow.FlowElement = this.getElementFromConnector(flow.start.connector);

    if (startElement) {
      const root: ParseTreeNode = {
        statement: '',
        flowElement: undefined,
        children: [],
      };
      this.parseElement(root, startElement);
      return root;
    } else {
      throw new Error('No start element found');
    }
  }

  private parseElement(parentNode: ParseTreeNode, element: Flow.FlowElement): void {
    if (parentNode.flowElement === element) {
      return;
    }
    if ('connector' in element) {
      const node: ParseTreeNode = {
        statement: element.name,
        flowElement: element,
        children: [],
      };
      parentNode.children.push(node);
      const child = this.getElementFromConnector(element.connector as Flow.FlowConnector);
      if (child) {
        this.parseElement(parentNode, child);
      }
    } else if (Flow.isFlowLoop(element)) {
      const loopNode: ParseTreeNode = {
        statement: element.name,
        flowElement: element,
        children: [],
      };
      parentNode.children.push(loopNode);
      const nextValueElement = this.getElementFromConnector(element.nextValueConnector);
      if (nextValueElement) {
        this.parseElement(loopNode, nextValueElement);
      }
      const noMoreValuesElement = this.getElementFromConnector(element.noMoreValuesConnector);
      if (noMoreValuesElement) {
        this.parseElement(parentNode, noMoreValuesElement);
      }
    } else {
      parentNode.children.push({
        statement: element.name,
        flowElement: element,
        children: [],
      });
    }
  }

  private getElementFromConnector(connector: Flow.FlowConnector): Flow.FlowElement {
    return this.flowElementByName?.get(connector.targetReference) as Flow.FlowElement;
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
