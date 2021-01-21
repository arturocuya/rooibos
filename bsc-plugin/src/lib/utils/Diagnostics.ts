import { BrsFile, ClassStatement, DiagnosticSeverity, FunctionStatement, Statement, Token, XmlFile, Range, BscFile, AnnotationExpression } from 'brighterscript';

import { RooibosAnnotation } from '../rooibos/Annotation';

function addDiagnostic(
  file: BscFile,
  code: number,
  message: string,
  startLine = 0,
  startCol = 0,
  endLine = -1,
  endCol = 99999,
  severity: DiagnosticSeverity = DiagnosticSeverity.Error
) {
  endLine = endLine === -1 ? startLine : endLine;
  file.addDiagnostics([createDiagnostic(file, code, message, startLine, startCol, endLine, endCol, severity)]);
}

function addDiagnosticForStatement(
  file: BrsFile,
  code: number,
  message: string,
  statement: Statement,
  severity: DiagnosticSeverity = DiagnosticSeverity.Error
) {
  let line = statement.range.start.line;
  let col = statement.range.start.character;
  file.addDiagnostics([createDiagnostic(file, code, message, line, col, line, 999999, severity)]);
}

function addDiagnosticForAnnotation(
  file: BscFile,
  code: number,
  message: string,
  annotation: AnnotationExpression,
  severity: DiagnosticSeverity = DiagnosticSeverity.Error,
  endChar?: number
) {
  let line = annotation.range.start.line;
  let col = annotation.range.start.character;

  file.addDiagnostics([createDiagnostic(file, code, message, line, col, annotation.range.end.line, annotation.range.end.character + 9999, severity)]);
}

function createDiagnostic(
  bscFile: BscFile,
  code: number,
  message: string,
  startLine = 0,
  startCol = 99999,
  endLine = 0,
  endCol = 99999,
  severity: DiagnosticSeverity = DiagnosticSeverity.Error
) {
  const diagnostic = {
    code: code,
    message: message,
    range: Range.create(startLine, startCol, endLine, endCol),
    file: bscFile,
    severity: severity
  };
  return diagnostic;
}

/**
 * Public methods
 */

export function diagnosticWrongAnnotation(file: BrsFile, statement: Statement, message: string) {
  addDiagnosticForStatement(
    file,
    2200,
    'Wrong kind of annotation.' + message,
    statement
  );
}

export function diagnosticNoGroup(file: BrsFile, statement: Statement) {
  addDiagnosticForStatement(
    file,
    2201,
    'Found test outside of a test group',
    statement
  );
}

export function diagnosticWrongParameterCount(file: BrsFile, statement: FunctionStatement, expectedParamCount = 0) {
  addDiagnosticForStatement(
    file,
    2202,
    `Function ${statement.name} defined with wrong number of params: expected ${expectedParamCount}`,
    statement
  );
}

export function diagnosticDuplicateSuite(file: BrsFile, statement: ClassStatement, annotation: RooibosAnnotation) {
  addDiagnosticForStatement(
    file,
    2203,
    `Test suite already declared with name: ${annotation.name}. This test suite will be skipped.`,
    statement
  );
}

export function diagnosticTestAnnotationOutsideOfGroup(file: BrsFile, statement: ClassStatement, annotation: RooibosAnnotation) {
  addDiagnosticForStatement(
    file,
    2204,
    `Found Group, when a test function was expected`,
    statement
  );
}

export function diagnosticIllegalParams(file: BrsFile, annotation: AnnotationExpression) {
  addDiagnosticForAnnotation(
    file,
    2205,
    `Could not parse params for test.`,
    annotation
  );
}

export function diagnosticWrongTestParameterCount(file: BrsFile, annotation: AnnotationExpression, gotCount = 0, expectedParamCount = 0) {
  addDiagnosticForAnnotation(
    file,
    2206,
    `Params for test do not match arg count on method. Got ${gotCount} expected ${expectedParamCount}`,
    annotation
  );
}

export function diagnosticNodeTestRequiresNode(file: BrsFile, annotation: AnnotationExpression) {
  addDiagnosticForAnnotation(
    file,
    2207,
    `Node name must be declared for a node test. This is the component that the generated test will extend.`,
    annotation
  );
}

export function diagnosticNodeTestIllegalNode(file: BrsFile, annotation: AnnotationExpression, nodeName: string) {
  addDiagnosticForAnnotation(
    file,
    2208,
    `Component ${nodeName}, is not found in this project. Node tests generate a new component that extends the component you wish to test. Please make sure that component exists and compiles.`,
    annotation
  );
}

export function diagnosticGroupWithNameAlreadyDefined(file: BrsFile, annotation: RooibosAnnotation) {
  addDiagnosticForAnnotation(
    file,
    2209,
    `Test group with name ${annotation.name}, is already declared in this suite. Ignoring`,
    annotation.annotation
  );
}

export function diagnosticTestWithNameAlreadyDefined(annotation: RooibosAnnotation) {
  addDiagnosticForAnnotation(
    annotation.file,
    2210,
    `Test with name ${annotation.name}, is already declared in this group. Ignoring`,
    annotation.annotation
  );
}

export function diagnosticIncompatibleAnnotation(annotation: RooibosAnnotation) {
  addDiagnosticForAnnotation(
    annotation.file,
    2211,
    `Was expecting a function, got a test annotation`,
    annotation.annotation
  );
}

export function diagnosticErrorProcessingFile(file: BrsFile, message: string) {
  addDiagnostic(
    file,
    2212,
    `General error : ` + message
  );
}

export function diagnosticErrorNoMainFound(file: BscFile) {
  addDiagnostic(
    file,
    2213,
    `Could not find main function to inject rooibos launch code. Please ensure your project has a main function`
  );
}

export function diagnosticEmptyGroup(file: BrsFile, annotation: RooibosAnnotation) {
  addDiagnosticForAnnotation(
    file,
    2214,
    `Test group with name ${annotation.name}, empty.`,
    annotation.annotation
  );
}

export function diagnosticNoTestFunctionDefined(file: BrsFile, annotation: RooibosAnnotation) {
  addDiagnosticForAnnotation(
    file,
    2215,
    `Multiple test annotations per functoin are not allows. ${annotation.name || ''}`,
    annotation.annotation
  );
}

export function diagnosticTestWithArgsButNoParams(file: BrsFile, annotation: AnnotationExpression, gotCount = 0) {
  addDiagnosticForAnnotation(
    file,
    2216,
    `Test method signature has arguments; but test has no paremeters. Got ${gotCount} args: expected 0. Did you forget your @params annotations?`,
    annotation
  );
}

