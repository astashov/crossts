import {Record} from "./record";
import {Location} from "./location";

interface EntityType {
  location: Location;
  line: number;
  length: number;
  offset: number;
}

export abstract class Entity extends Record<EntityType> {
  public static comparator(a: Entity, b: Entity): number {
    if (a.line === b.line) {
      return a.offset - b.offset;
    } else {
      return a.line - b.line;
    }
  }
  public get location(): Location { return this.data.location };
  public get line(): number { return this.data.line };
  public get length(): number { return this.data.length };
  public get offset(): number { return this.data.offset };
  public toJson(): {[key: string]: string | number} {
    // console.log(this.location.httpPath);
    return {
      line: this.line,
      offset: this.offset,
      length: this.length,
      remotePath: `${this.location.httpPath}#L${this.line}`
    };
  }
  public toString(): string {
    return `Entity: ${this.line}:${this.offset}-${this.length} (${this.location.httpPath})`;
  }
}

export class Declaration extends Entity {}
export class Import extends Declaration {}
export class Reference extends Entity {}

