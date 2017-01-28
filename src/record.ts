export type RecordClass<D, R> = {new (data: D, ...rest: any[]): R};

export class Record<I> {
  constructor(protected data: I) {}

  public update(data: Partial<I>): this {
    const newData = Object.assign({}, this.data, data);
    return new (<RecordClass<I, this>>this.constructor)(newData);
  }

  public toString(): string {
    return JSON.stringify(this.data);
  }
}

