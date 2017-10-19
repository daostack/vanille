export class ToUpperValueConverter {
  toView(value: string) {
    return (value || '').toUpperCase();
  }
}