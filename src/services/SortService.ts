export enum SortOrder {
  ASC = 1,
  DESC = -1
}

export class SortService {

  public static evaluateString(a: string, b: string, sortOrder: SortOrder = SortOrder.ASC) {
    if (!a && !b) return 0;

    if (!a) return -sortOrder;
    if (!b) return sortOrder;

    a = a.toLowerCase();
    b = b.toLowerCase();

    return a.localeCompare(b) * sortOrder;
  }

  public static evaluateNumber(a: number, b: number, sortOrder: SortOrder = SortOrder.ASC) {
    const isDefinedA = SortService.isDefined(a);
    const isDefinedB = SortService.isDefined(b);

    if (!isDefinedA && !isDefinedB) return 0;

    if (!isDefinedA) return -sortOrder;
    if (!isDefinedB) return sortOrder;

    return (a - b) * sortOrder;
  }

  public static evaluateDateTime(valueA: string, valueB: string, sortOrder: SortOrder = SortOrder.ASC) {

    let a = new Date(valueA).valueOf();
    let b = new Date(valueB).valueOf();

    if (!a && !b) return 0;

    if (!a) return -sortOrder;
    if (!b) return sortOrder;

    return (a - b) * sortOrder;
  }

  private static isDefined(v: any): boolean {
    return typeof v !== "undefined";
  }
}
