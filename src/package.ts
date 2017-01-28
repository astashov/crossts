import * as path from "path";
import * as fs from "fs";
import * as process from "process";
import {Url} from "./url";
import {Record} from "./record";

export type PackageKind = "project" | "module" | "typings";

interface PackageType {
  directory: string;
  kind: PackageKind;
  url: string;
}

export class Package extends Record<PackageType> {
  public static fromFileName(fileName: string): Package | undefined {
    const splittedPath = fileName.split("/");
    if (fileName.indexOf(process.cwd()) !== -1) {
      if (splittedPath.indexOf("node_modules") !== -1) {
        while (splittedPath.length > 1) {
          const joinedPath = splittedPath.join("/");
          const packageJsonPath = path.join(joinedPath, "package.json");
          if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
            if (packageJson["repository"] && packageJson["repository"]["url"] && packageJson["repository"]["url"].indexOf("github") !== -1) {
              const url = packageJson["repository"]["url"].replace(/^git:/, "https:").replace(/^git\+/, "").replace(/\.git$/, "");
              const pkg = new Package({
                kind: "module",
                url: `${url}/blob/${packageJson["gitHead"]}`,
                directory: joinedPath
              });
              return pkg;
            }
          }
          splittedPath.pop();
        }
      } else if (splittedPath.indexOf("typings") !== -1) {
        const typingsJsonFilename = path.join(path.dirname(fileName), "typings.json");
        if (fs.existsSync(typingsJsonFilename)) {
          const typingsJson = JSON.parse(fs.readFileSync(typingsJsonFilename, "utf-8"));
          let urlString = typingsJson["tree"]["src"];
          if (urlString.match(/^https?:\/\//)) {
            let url = Url.fromString(urlString);
            url = url.replaceHost(url.host.replace("raw.githubusercontent.com", "github.com"));
            let pathAsArrayCopy = [...url.pathAsArray];
            pathAsArrayCopy.splice(2, 0, "blob");
            if (urlString.match(/typings.json$/)) {
              pathAsArrayCopy = pathAsArrayCopy.slice(0, pathAsArrayCopy.length - 1);
              pathAsArrayCopy.push(typingsJson["tree"]["main"])
            }
            url = url.replacePath(pathAsArrayCopy.join("/"));
            return new Package({
              kind: "typings",
              url: url.toString(),
              directory: path.dirname(fileName)
            });
          } else {
            return new Package({
              kind: "project",
              url: "",
              directory: urlString.replace(process.cwd() + "/", "")
            });
          }
        }
      } else {
        return new Package({kind: "project", directory: process.cwd(), url: ""});
      }
    }
  }
  public get directory(): string { return this.data.directory; }
  public get kind(): PackageKind { return this.data.kind; }
  public get url(): string { return this.data.url; }
}

