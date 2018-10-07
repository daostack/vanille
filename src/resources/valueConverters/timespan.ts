import { autoinject } from "aurelia-framework";
import { DateService } from "../../services/DateService"

@autoinject
export class TimespanValueConverter {
  constructor(private dateService: DateService) {

  }

  /**
   * convert between milliseconds in the viewmodel and a string.
   */
  toView(value: number): string | null {
    return this.dateService.ticksToTimeSpanString(value);
  }

  // fromView(value: string): number | null {
  //   return this.dateService.fromString(value, format);

  // }
}
