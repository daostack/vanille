import * as numeral from "numeral";

export class NumberService {

    /**
     * Note this will round up when needed and last displayed digit is .5 or higher.
     * @param value
     * @param format
     */
    public toString(value: number, format?: string): string|null {

        // this helps to display the erroneus value in the GUI
        if (typeof (value) === 'string') {
            return <any>value;
        }

        if (Number.isNaN(value)) {
            return null;
        }
        return numeral(value).format(format);
    }

    public fromString(value: string, decimalPlaces: number = 1000): number {

        // this helps to display the erroneus value in the GUI
        if (!this.stringIsNumber(value, decimalPlaces)) {
            return <any>value;
        }

        return numeral(value).value();
    }

    /**
     * returns whether string represents a number.  can have commas and a decimal (note decimal is not allowed if decimalPlaces is 0)
     * default number of decimmals is basically unlimited
     * @param value
     */
    public stringIsNumber(value?: string, decimalPlaces: number = 1000): boolean {

        if (typeof value === "number") return true;

        if ((value === null) || (value === undefined)) return false;

        value = value.trim();

        let regex = new RegExp(this.getNumberRegexString(decimalPlaces));
        return regex.test(value);
    }

    private getNumberRegexString(decimalPlaces: number = 0) {
        return (decimalPlaces !== 0) ?
            `^[+|-]?(((\\d{1,3}\\,)((\\d{3}\\,)?)(\\d{3}(\\.\\d{0,${decimalPlaces}})?))|(\\d{1,})|(\\d{0,}(\\.\\d{0,${decimalPlaces}})))$` : 
            `^[+|-]?(((\\d{1,3}\\,)((\\d{3}\\,)?)(\\d{3}))|(\\d{1,}))$`;
    }

    public round(value: number, decimals: number, type: RoundingType): number {
        return type === RoundingType.Bankers ? this.roundBankers(value, decimals) : this.roundHalfUp(value, decimals);
    }

    public roundForSalesTax(value: number): number {
        return this.roundHalfUp(value, 2);
    }

    public roundHalfUp(value: number, decimals: number): number {
        return ((value !== null) && (value !== undefined)) ? this._halfUpRound(value, decimals) : value;
    }

    public roundBankers(value: number, decimals: number): number {
        return ((value !== null) && (value !== undefined)) ? this._bankersRound(value, decimals) : value;
    }

    private _bankersRound(num: number, decimals: number) {
        var d = decimals || 0;
        var m = Math.pow(10, d);
        var n = +(d ? num * m : num).toFixed(8); // Avoid rounding errors
        var i = Math.floor(n),
            f = n - i;
        var e = 1e-8; // Allow for rounding errors in f
        var r = (f > 0.5 - e && f < 0.5 + e) ? ((i % 2 === 0) ? i : i + 1) : Math.round(n);
        return d ? r / m : r;
    }

    // up if .5 or higher, otherwise down
    private _halfUpRound(num: number, decimals: number) {
        var pow = Math.pow(10, (decimals) ? Math.abs(decimals) : 0);
        return Math.round(num * pow) / pow;
    }
}

export enum RoundingType {
    Bankers = 1,
    HalfUp = 2
}