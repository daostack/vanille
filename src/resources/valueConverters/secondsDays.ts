
/**
 * show days from seconds.  For best results, use: `& updateTrigger:'blur'`
 */
export class SecondsDaysValueConverter {

  /**
   * convert days as string in view to seconds as integer
   * @param days 
   */
  fromView(days: string): number | undefined | null {
    if ((days == undefined) || (days == null)) {
      return <any>days;
    }

    if (days.length === 0) {
      return undefined;
    }

    const num = Number.parseFloat(days);
    if (isNaN(num)) {
      return undefined;
    }

    /**
     * convert days to seconds, rounding down to nearest integer second
     */
    return Math.floor(num * 86400);
  }

  toView(seconds: number): string {
    if ((seconds == undefined) || (seconds == null)) {
      return <any>seconds;
    }
    /*
     * convert seconds to days
     */
    return (seconds / 86400).toString();
  }
}
