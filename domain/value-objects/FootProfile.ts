export type FootProfileProps = {
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
};

export class FootProfile {
  private constructor(
    public readonly lengthMm?: number,
    public readonly widthMm?: number,
    public readonly heightMm?: number
  ) {}

  static create(props: FootProfileProps) {
    return new FootProfile(props.lengthMm, props.widthMm, props.heightMm);
  }

  hasAnyDimension() {
    return (
      typeof this.lengthMm === "number" ||
      typeof this.widthMm === "number" ||
      typeof this.heightMm === "number"
    );
  }
}
