import {Record} from "./record";
import {Package} from "./package";

interface LocationType {
  fileName: string;
  pkg: Package;
}

export class Location extends Record<LocationType> {
  public static build(pkg: Package, fileName: string): Location {
    fileName = fileName.replace(`${pkg.directory.replace(/\/$/, "")}/`, "");
    return new Location({fileName: fileName, pkg: pkg});
  }
  public get fileName(): string { return this.data.fileName };
  public get pkg(): Package { return this.data.pkg };
  public get httpPath(): string {
    if (this.pkg.kind === "project") {
      return this.fileName;
    } else if (this.pkg.kind === "typings") {
      return this.pkg.url;
    } else {
      return this.pkg.url + "/" + this.fileName;
    }
  }

  public toString(): string {
    return `Location: ${this.fileName}`;
  }
}

