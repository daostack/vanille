import { fnVoid } from 'services/ArcService';

export class Utils {
  public static sleep(milliseconds: number): Promise<any> {
    return new Promise((resolve: fnVoid): any => setTimeout(resolve, milliseconds));
  }

}
