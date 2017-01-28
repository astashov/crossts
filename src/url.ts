export interface Params {
  [propName: string]: string | null;
}

interface Parts {
  scheme?: string;
  host?: string;
  port?: string;
  path?: string;
  params?: Params;
}

export class Url {
  constructor(private parts: Parts) {}

  public static fromString(input: string): Url {
    const parsed = {} as Parts;

    const schemeMatcher = /^(\w+):\/\//;
    const schemeMatch = schemeMatcher.exec(input);
    if (schemeMatch != null) {
      parsed.scheme = schemeMatch[1];
      input = input.substr(schemeMatch[0].length);
    }

    const hostMatcher = /^(?:\/\/)?(?!:\d+|\/)(.+?)(\/|:|\?|$)/;
    const hostMatch = hostMatcher.exec(input);
    if (hostMatch != null) {
      parsed.host = hostMatch[1];
      input = input.replace(/^\/\//, "").substr(parsed.host.length);
    }

    const portMatcher = /^:(\d+)/;
    const portMatch = portMatcher.exec(input);
    if (portMatch != null) {
      parsed.port = portMatch[1];
      input = input.substr(parsed.port.length + 1);
    }

    const paramsMatcher = /\?(.+)$/;
    const paramsMatch = paramsMatcher.exec(input);
    if (paramsMatch != null) {
      parsed.params = parsed.params || {};
      paramsMatch[1].split("&").map((param: string) => param.split("=")).forEach(([k, v]) => {
        parsed.params![k] = v;
      });
      input = input.replace(paramsMatcher, "");
    } else {
      parsed.params = {};
    }

    parsed.path = normalizePath(input);

    return new Url(parsed);
  }

  public replaceHost(host: string): Url {
    return new Url({...this.parts, host: host});

  }

  public appendPath(path: string): Url {
    const normalizedPath = path.replace(/^(\/+)/, "");
    const newPath = `/${this.pathAsArray.concat(normalizedPath).join("/")}`;
    return new Url({...this.parts, path: newPath});
  }

  public replacePath(path: string): Url {
    const normalizedPath = normalizePath(path);
    return new Url({...this.parts, path: normalizedPath});
  }

  public appendParams(params: Params): Url {
    const newParams = {...this.parts.params, ...params};
    return new Url({...this.parts, params: newParams});
  }

  public toString(): string {
    let result = "";
    if (this.scheme.length > 0) {
      result += `${this.scheme}://`;
    }
    if (this.host.length > 0) {
      if (this.scheme.length === 0) {
        result += "//";
      }
      result += this.host;
    }
    if (this.port.length > 0) {
      result += `:${this.port}`;
    }
    if (this.path.length > 0) {
      result += this.path;
    }
    if (Object.keys(this.params).length > 0) {
      result += "?" + (Object.keys(this.params).reduce((memo: string[], key: string) => {
            if (this.params[key]) {
              memo.push(`${key}=${this.params[key]}`);
            } else {
              memo.push(`${key}`);
            }
            return memo;
          }, []).join("&"));
    }
    return result;
  }

  get host(): string {
    return this.parts.host || "";
  }

  get scheme(): string {
    return this.parts.scheme || "";
  }

  get port(): string {
    return this.parts.port || "";
  }

  get path(): String {
    return this.parts.path || "";
  }

  get params(): Params {
    return {...this.parts.params || {}};
  }

  get pathAsArray(): String[] {
    return this.path.split("/").filter((str) => str.length > 0);
  }
}

function normalizePath(path: string): string {
  let result = path.replace(/(\/+)/, "/");
  if (result.length > 0 && result[0] !== "/") {
    result = `/${result}`;
  }
  return result;
}