export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: "KRW"
  ) {}

  static won(amount: number) {
    if (amount < 0) {
      throw new Error("Money amount cannot be negative");
    }
    return new Money(amount, "KRW");
  }

  format() {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: this.currency,
      maximumFractionDigits: 0
    }).format(this.amount);
  }
}
