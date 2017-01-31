import {Declaration, Reference, Import, Entity} from "./entity";

export class ParsedData {
  constructor(
      public declarationIndex: {[key: string]: Declaration} = {},
      public referenceIndex: {[key: string]: Reference} = {},
      public declarations: {[key: string]: Set<string>} = {},
      public references: {[key: string]: string} = {},
      public fileNames: {[key: string]: Set<string>} = {}
  ) {}

  public addReferenceAndDeclaration(reference: Reference, declaration: Declaration): void {
    if (this.fileNames[reference.location.fileName] == null) {
      this.fileNames[reference.location.fileName] = new Set();
    }
    this.fileNames[reference.location.fileName].add(reference.toString());

    if (this.fileNames[declaration.location.fileName] == null) {
      this.fileNames[declaration.location.fileName] = new Set();
    }
    this.fileNames[declaration.location.fileName].add(declaration.toString());

    if (this.declarations[declaration.toString()] == null) {
      this.declarations[declaration.toString()] = new Set();
    }
    this.declarations[declaration.toString()].add(reference.toString());

    this.references[reference.toString()] = declaration.toString();

    this.declarationIndex[declaration.toString()] = declaration;
    this.referenceIndex[reference.toString()] = reference;
  }

  public toJson(): any {
    const json = {};
    const fileNames = Object.keys(this.fileNames).filter((fileName) => {
      const entities = this.fileNames[fileName];
      return [...entities.values()].map(str => this.referenceIndex[str]).some(e => e instanceof Reference);
    });
    fileNames.forEach((fileName) => {
      const entities = this.fileNames[fileName];
      json[fileName] = {
        references: [...entities.values()]
            .map(str => this.referenceIndex[str])
            .filter(e => e instanceof Reference)
            .sort(Entity.comparator)
            .map((ref: Reference) => {
              const declaration = this.declarationIndex[this.references[ref.toString()]];
              let remotePath = declaration.location.httpPath;
              if (!(declaration instanceof Import)) {
                remotePath = `${remotePath}#L${declaration.line}`;
              }
              return {
                line: ref.line,
                offset: ref.offset,
                length: ref.length,
                remotePath: remotePath
              }
            }),
        declarations: [...entities.values()]
            .map(str => this.declarationIndex[str])
            .filter(e => e instanceof Declaration)
            .sort(Entity.comparator)
            .map((decl: Declaration) => {
              const references = Array.from(this.declarations[decl.toString()]).map(str => this.referenceIndex[str]);
              return {
                line: decl.line,
                offset: decl.offset,
                length: decl.length,
                references: references.map(ref => {
                  return {
                    line: ref.line,
                    offset: ref.offset,
                    length: ref.length,
                    remotePath: `${ref.location.httpPath}#L${ref.line}`
                  };
                })
              };
            })
      };
    });
    return json;
  }
}

