import { autoinject } from "aurelia-framework";
import * as moment from "moment";
import Moment = moment.Moment;

@autoinject
export class DateService {

  private formats: Map<string, string>;
  private localTimezoneOffset: number;

  constructor() {
    this.localTimezoneOffset = moment().utcOffset();
    this.configure();
    // include french: moment.locale("fr-ca");
  }

  /**
   * Trying here to keep everything in local timezone with option to translate into UTC when formating as a string.
   * The utc option will only control how toString() behaves, and only when using moment's toString.
   * 
   * Note that javascript toString() always displays in local timezone.
   *
   * Datetime values are always formatted by the JSON serializer into strings, coming and going at either end.
   * Coming from the server into the client, when converted to objects, they remain as
   * string values unless manually converted to Dates (note the column sorting algorithm,
   * at this writing, assumes they have not been converted!).
   * 
   * More regarding JSON datetimes:
   * 
   * The javascript JSON serializer always converts date representations into a string representation in UTC
   * (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toJSON).
   * The JSON format is the date in UTC plus the offset to local, so midnight local would stored as 4AM UTC.
   * That will be deserialized server-side to a C# DateTime with .Kind as utc.  It is unaltered when sent to Sql Server.
   * When retrieving from Sql Server, it comes into C# as a DateTime with Kind as "unspecified".
   * When serialized as such to JSON, it is converted to the webserver's timezone.
   * Since we want to be receiving these in Utc, we must, in automapper, make sure all viewmodel datetimes have Utc as their Kind.
   *
   * Sometimes we do want to pass a real Date as an argument....for some reason it gets serialized using a different format, lacking the Z.
   * (at least with the fetch serialized this is true).
   */
  private createMoment(date?: Date | string, utc: boolean = false): Moment {

    let m: Moment = date ? moment(date) : moment();

    if (utc) {
      m = this.momentToUTC(m);
    }

    return m;
  }

  private createMomentFromString(str: string, format?: string, utc: boolean = false): Moment {
    let m: Moment = moment(str, format, true); // true for strict

    if (utc) {
      m = this.momentToUTC(m);
    }

    return m;
  }

  private createMomentFromTicks(ticks: number, utc: boolean = false): Moment {
    let m: Moment = moment(ticks);

    if (utc) {
      m = this.momentToUTC(m);
    }

    return m;
  }

  public configure(): void {

    this.formats = new Map<string, string>();

    let formatArray: Array<IFormat> = [
      {
        "key": "friendly",
        "format": "dddd MMMM Do, YYYY"
      },
      {
        "key": "table-date",
        "format": "YYYY-MM-DD"
      },
      {
        "key": "table-datetime",
        "format": "YYYY-MM-DD mm:ss.sss"
      },
      {
        "key": "friendlyDateTime",
        "format": "HH[h]mm dddd MMMM Do, YYYY"
      },
      {
        "key": "json",
        "format": "YYYY-MM-DDTHH:mm:ss.sssZ"
      }
    ];

    for (let format of formatArray) {
      this.formats.set(format.key, format.format);
    }

    //this.defaultFriendlyFormat = this.formats.get("friendly");
    //this.defaultTableFormat = this.formats.get("table");
    //this.toJsonFormat = this.formats.get("json");
  }

  public get tomorrow(): Date {
    var tomorrow = this.createMoment().add(1, 'days');
    var dtTomorrow = new Date(tomorrow.year(), tomorrow.month(), tomorrow.date());
    return dtTomorrow;
  }

  public get today(): Date {
    var today = this.createMoment();
    var dtToday = new Date(today.year(), today.month(), today.date());
    return dtToday;
  }

  // this is somewhat meaningless except in how it prints it's string
  public get utcNow(): Date {
    return this.createMoment(undefined, true).toDate();
  }

  /**
   * This will literally change the value of the Date.  Use when a date has been
   * computed as being in Utc and you want the local time.
   * @param d
   */
  public translateUtcToLocal(d: Date) {
    return this.createMoment(d).subtract(this.localTimezoneOffset, "minutes").toDate();
  }

  public translateLocalToUtc(d: Date) {
    return this.createMoment(d).add(this.localTimezoneOffset, "minutes").toDate();
  }

  /**
   * convert one date string to a different date string for the same date and time.
   * @param dateString
   * @param paramsFrom
   * @param paramsTo
   */
  public convertFormat(
    dateString: string,
    paramsFrom?: IFormatParameters | string,
    paramsTo?: IFormatParameters | string) {

    if (paramsFrom === paramsTo) {
      return dateString;
    }

    return this.createMomentFromString(dateString, this.getSafeParams(paramsFrom).format).format(this.getSafeParams(paramsTo).format);
  }

  public ticksToString(ticks: number, params?: IFormatParameters | string): string | null {
    if (!ticks) {
      return "";
    }

    let d = this.createMomentFromTicks(ticks).toDate();

    // will account for optional utc here
    return this.toString(d, params);
  }

  public ticksToDate(ticks: number): Date | null {
    if (!ticks) {
      return null;
    }

    // utc is meaningless here
    return this.createMomentFromTicks(ticks).toDate();
  }

  public dateStringToTicks(dtString: string, params?: IFormatParameters | string): number {
    if (!dtString) {
      return 0;
    }

    let parms = this.getSafeParams(params);

    // ignore utc, is meaningless here
    return this.createMomentFromString(dtString, parms.format).valueOf();
  }

  public dateToTicks(dt: Date): number {
    if (!dt) {
      return 0;
    }
    return this.createMoment(dt).valueOf();
  }

  public ticksToTimeSpanString(ms: number): string | null {
    if ((ms === null) || (typeof (ms) === "undefined")) {
      return null;
    }

    const days = Math.floor(ms / 86400000);
    ms = ms % 86400000;
    const hours = Math.floor(ms / 3600000);
    ms = ms % 3600000;
    const minutes = Math.floor(ms / 60000);
    ms = ms % 60000;
    const seconds = Math.floor(ms / 1000);
    ms = ms % 1000;

    let result: string = "";

    if (days) {
      result = `${days} days`;
    }

    if (hours) {
      result += `${result.length ? ', ' : ''}${hours} hours`;
    }

    if (minutes) {
      result += `${result.length ? ', ' : ''}${minutes} minutes`;
    }

    if (seconds) {
      result += `${result.length ? ', ' : ''}${seconds} seconds`;
    }

    if (ms) {
      result += `${result.length ? ', ' : ''}${ms} milliseconds`;
    }

    return result;
  }

  public toString(dt: Date, params?: IFormatParameters | string): string | null {
    if (!dt) {
      return null;
    }

    let parms = this.getSafeParams(params);

    return this.createMoment(dt, parms.utc).format(parms.format);
  }

  /**
   * note this seems to be match quite well with the ISO standard, but the "json"
   * format in the config.json file doesn't.
   * @param dt
   */
  public toISOString(dt: Date): string | null {
    if (!dt) {
      return null;
    }

    return this.createMoment(dt).toISOString();
  }

  public fromISOString(str: string): Date | null {
    if (!str) {
      return null;
    }

    return this.createMomentFromString(str).toDate();
  }

  public nameofDay(day: number): string {
    return moment.weekdays(day);
  }

  /**
   * Convert moment so a toString() will show UTC time, not local.
   * Does not affect the actual earth-time value at all, just the time as
   * one would see it at the same earth-time moment in the UTC timezone.
   * @param m
   */
  private momentToUTC(m: Moment): Moment {
    return m.utc();
  }

  public fromString(str: string, params?: IFormatParameters | string): Date | null {
    if (!str) {
      return null;
    }

    let parms = this.getSafeParams(params);

    // ignore utc, is meaningless here
    return this.createMomentFromString(str, parms.format).toDate();
  }

  /**
   * *day is 0-6, where 0 is sunday
   * @param day
   */
  public nextInstanceOfDay(dayTarget: number, includeToday: boolean = false): Date {
    let today = this.today;
    let dayToday = today.getDay();

    if ((dayToday === dayTarget) && includeToday) {
      return today;
    }

    let weeklen = dayTarget > dayToday ? 0 : 7;

    let nextInstance = this.createMoment(today).add(weeklen + dayTarget - dayToday, "days");
    return new Date(nextInstance.year(), nextInstance.month(), nextInstance.date());
  }

  /**
   * return IFormatParameters from IFormatParameters|string.
   * params is either not set, or is a string which is the key to use, or is an IFormatParameters
   * @param params
   */
  public getSafeParams(params?: IFormatParameters | string | undefined | null): IFormatParameters {

    if (!params) {
      //return this.defaultTableFormat;
      return {};
    }

    /**
     * format can be either raw or a key into the config (this.formats)
     */
    if (typeof (params) === "string") {
      return { format: this.formats.get(params as string) || params as string };
    } else {
      let parms = params as IFormatParameters;

      let format = parms.format ? this.formats.get(parms.format) || parms.format : undefined;
      return {
        utc: parms.utc,
        format: format
      };
    }
  }
}

interface IFormat {
  key: string;
  format: string;
}

export interface IFormatParameters {
  format?: string;
  // see notes above about utc
  utc?: boolean;
}
