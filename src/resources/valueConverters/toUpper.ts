export class ToUpperValueConverter {
  toView(value: string) {
    return (value || '').toUpperCase();
  }
  fromView(value: string) {
    return (value || '').toUpperCase();
  }
}
