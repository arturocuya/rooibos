import { BrsFile, ClassStatement } from 'brighterscript';

import { diagnosticIllegalParams, diagnosticNodeTestIllegalNode, diagnosticNodeTestRequiresNode } from '../utils/Diagnostics';

import { Annotation } from './Annotation';

import { TestGroup } from './TestGroup';
import { addOverriddenMethod, changeFunctionBody, sanitizeBsJsonString } from './Utils';

/**
 * base of test suites and blocks..
 */
export class TestBlock {
  constructor(
    public annotation: Annotation
  ) {
  }

  public get file(): BrsFile {
    return this.annotation.file;
  }
  public get pkgPath(): string {
    return this.file.pkgPath;
  }

  public get name(): string {
    return this.annotation.name;
  }

  public get isSolo(): boolean {
    return this.annotation.isSolo;
  }

  public get isIgnored(): boolean {
    return this.annotation.isIgnore;
  }

  public isValid = false;
  public isIncluded = false;

  public hasFailures = false;
  public hasSoloTests = false;
  public hasIgnoredTests = false;

  public setupFunctionName: string;
  public tearDownFunctionName: string;
  public beforeEachFunctionName: string;
  public afterEachFunctionName: string;

}

export class TestSuite extends TestBlock {
  constructor(annotation: Annotation, classStatement: ClassStatement) {
    super(annotation);
    this.classStatement = classStatement;
    this.isNodeTest = annotation.nodeName && annotation.nodeName.trim() !== '';
    this.nodeName = annotation.nodeName;
    this.generatedNodeName = this.name.replace(/[^a-zA-Z0-9]/g, '_');

  }

  //state
  public classStatement: ClassStatement;
  public testGroups = new Map<string, TestGroup>();
  public nodeName: string;
  public generatedNodeName: string;
  public hasSoloGroups = false;
  public isNodeTest = false;

  public addGroup(group: TestGroup) {
    this.testGroups.set(group.name, group);
    if (group.ignoredTestCases.length > 0) {
      this.hasIgnoredTests = true;
    }
    if (group.hasSoloTests) {
      this.hasSoloTests = true;
    }
    this.isValid = true;
  }

  public addDataFunctions() {
    //add the data body to the test subclass
    addOverriddenMethod(this.classStatement, 'getTestSuiteData', `return ${this.asText()}`);
  }

  public validate() {
    if (this.isNodeTest) {
      if (!this.nodeName) {
        diagnosticNodeTestRequiresNode(this.file, this.annotation.token);
      } else if (!this.file.program.getComponent(this.nodeName)) {
        diagnosticNodeTestIllegalNode(this.file, this.annotation.token, this.nodeName);
      }
    }
  }

  public asJson(): object {
    return {
      name: this.name,
      filePath: this.pkgPath,
      valid: this.isValid,
      hasFailures: this.hasFailures,
      hasSoloTests: this.hasSoloTests,
      hasIgnoredTests: this.hasIgnoredTests,
      hasSoloGroups: this.hasSoloGroups,
      isSolo: this.isSolo,
      isIgnored: this.isIgnored,
      testGroups: [...this.testGroups.values()].filter((testGroup) => testGroup.isIncluded)
        .map((testGroup) => testGroup.asJson()),
      setupFunctionName: this.setupFunctionName,
      tearDownFunctionName: this.tearDownFunctionName,
      isNodeTest: this.isNodeTest,
      nodeName: this.nodeName,
      beforeEachFunctionName: this.beforeEachFunctionName,
      afterEachFunctionName: this.afterEachFunctionName
    };
  }

  public asText(): string {
    let testGroups = [...this.testGroups.values()].filter((testGroup) => testGroup.isIncluded)
      .map((testGroup) => testGroup.asText());
    return `{
      name: ${sanitizeBsJsonString(this.name)}
      isSolo: ${this.isSolo}
      isIgnored: ${this.isIgnored}
      filePath: "${this.pkgPath}"
      lineNumber: ${this.classStatement.range.start.line}
      valid: ${this.isValid}
      hasFailures: ${this.hasFailures}
      hasSoloTests: ${this.hasSoloTests}
      hasIgnoredTests: ${this.hasIgnoredTests}
      hasSoloGroups: ${this.hasSoloGroups}
      setupFunctionName: "${this.setupFunctionName || ''}"
      tearDownFunctionName: "${this.tearDownFunctionName || ''}"
      beforeEachFunctionName: "${this.beforeEachFunctionName || ''}"
      afterEachFunctionName: "${this.afterEachFunctionName || ''}"
      isNodeTest: ${this.isNodeTest || false}
      nodeName: "${this.nodeName || ''}"
      generatedNodeName: "${this.generatedNodeName || ''}"
      testGroups: [${testGroups}]
    }`;
  }
}
