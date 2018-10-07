/**
 * use `| keys` to repeatFor an object's property values
 */
export class KeysValueConverter {
  toView(obj) {
    let temp = [];
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        temp.push(prop);
      }
    }
    return temp;
  }
}
