import * as ts from "typescript";
import * as path from "path";
import * as process from "process";
import {ParsedData} from "./parsed_data";
import {Package} from "./package";
import {Location} from "./location";
import {Reference, Declaration, Import} from "./entity";

function visitNodes(node: ts.Node, file: ts.SourceFile, typeChecker: ts.TypeChecker, parsedData: ParsedData = new ParsedData()): ParsedData {
  let symbol: ts.Symbol | null = typeChecker.getSymbolAtLocation(node);
  if (symbol == null) {
    try {
      const type = typeChecker.getTypeAtLocation(node);
      symbol = type ? type.getSymbol() : null;
    } catch (_) {
      symbol = null;
    }
  }
  if (symbol != null && symbol.getDeclarations() != null && symbol.getDeclarations()[0] != null) {
    const declarationNode = symbol.getDeclarations()[0] as ts.Declaration;
    const declarationFile = declarationNode.getSourceFile();
    if (declarationNode !== node && declarationNode !== node.parent && isValidReference(node)) {
      const referencePackage = Package.fromFileName(file.fileName);
      const declarationPackage = Package.fromFileName(declarationFile.fileName);
      if (referencePackage != null && declarationPackage != null) {
        const referenceLineAndOffset = file.getLineAndCharacterOfPosition(node.getStart());
        const reference = new Reference({
          location: Location.build(referencePackage, file.fileName),
          length: node.getEnd() - node.getStart(),
          line: referenceLineAndOffset.line + 1,
          offset: referenceLineAndOffset.character
        });
        if (file.fileName.indexOf("src/main.ts") !== -1) {
          // console.log(syntaxKindToName(node.kind), syntaxKindToName(node.parent.kind), "reference", reference.toString());
        }
        const declarationName = declarationNode.name;
        let declaration: Declaration;
        if (declarationName != null) {
          const declarationLineAndOffset = declarationFile.getLineAndCharacterOfPosition(declarationName.getStart());
          declaration = new Declaration({
            location: Location.build(declarationPackage, declarationFile.fileName),
            line: declarationLineAndOffset.line + 1,
            length: declarationName.getEnd() - declarationName.getStart(),
            offset: declarationLineAndOffset.character
          });
        } else {
          declaration = new Import({
            location: Location.build(declarationPackage, declarationFile.fileName),
            line: 0,
            length: 0,
            offset: 0
          });
        }
        if (file.fileName.indexOf("src/main.ts") !== -1) {
          // konsole.log(syntaxKindToName(declarationNode.kind), syntaxKindToName(declarationNode.parent.kind), "declaration", declaration.toString());
        }
        parsedData.addReferenceAndDeclaration(reference, declaration);
      }
    }
  }
  ts.forEachChild(node, (n) => { visitNodes(n, file, typeChecker, parsedData); });
  return parsedData;
}

export function main(inputFiles: string | string[]): void {
  if (!(inputFiles instanceof Array)) {
    inputFiles = [inputFiles];
  }

  const input = inputFiles.map(i => path.resolve(path.join(process.cwd(), i)));
  const program: ts.Program = ts.createProgram(input, {typeRoots: [process.cwd()]});
  const parsedData = new ParsedData();
  program.getSourceFiles().forEach((file) => {
    visitNodes(file, file, program.getTypeChecker(), parsedData);
  });
  console.log(JSON.stringify(parsedData.toJson()));
}

export function syntaxKindToName(kind: ts.SyntaxKind) {
  return (<any>ts).SyntaxKind[kind];
}

export function isValidReference(node: ts.Node) {
  return node.kind === ts.SyntaxKind.Identifier
      || node.kind === ts.SyntaxKind.StringLiteral
      || node.kind === ts.SyntaxKind.ImportSpecifier
      || node.kind === ts.SyntaxKind.SuperKeyword;
}