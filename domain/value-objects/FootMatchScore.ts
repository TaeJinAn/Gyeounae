import { FootProfile } from "./FootProfile";

export type FootMatchSigma = {
  length: number;
  width: number;
  height: number;
};

export type FootMatchInput = {
  buyer: FootProfile;
  seller: FootProfile;
  sigma?: Partial<FootMatchSigma>;
};

export type FootMatchScoreResult = {
  totalPercent: number;
  lengthPercent: number;
  widthPercent: number;
  heightPercent: number;
};

export class FootMatchScore {
  private static readonly defaultSigma: FootMatchSigma = {
    length: 10,
    width: 5,
    height: 4
  };

  static compute(input: FootMatchInput): FootMatchScoreResult {
    const sigma = {
      ...this.defaultSigma,
      ...input.sigma
    };
    const lengthPercent = this.similarity({
      buyerValue: input.buyer.lengthMm,
      sellerValue: input.seller.lengthMm,
      sigma: sigma.length
    });
    const widthPercent = this.similarity({
      buyerValue: input.buyer.widthMm,
      sellerValue: input.seller.widthMm,
      sigma: sigma.width
    });
    const heightPercent = this.similarity({
      buyerValue: input.buyer.heightMm,
      sellerValue: input.seller.heightMm,
      sigma: sigma.height
    });

    const weighted =
      lengthPercent * 0.6 + widthPercent * 0.3 + heightPercent * 0.1;
    const totalPercent = this.clamp(Math.round(weighted));

    return {
      totalPercent,
      lengthPercent,
      widthPercent,
      heightPercent
    };
  }

  private static similarity(command: {
    buyerValue?: number;
    sellerValue?: number;
    sigma: number;
  }) {
    if (
      typeof command.buyerValue !== "number" ||
      typeof command.sellerValue !== "number"
    ) {
      return 0;
    }
    const delta = command.buyerValue - command.sellerValue;
    const score =
      Math.exp(-(delta * delta) / (2 * command.sigma * command.sigma)) * 100;
    return this.clamp(Math.round(score));
  }

  private static clamp(value: number) {
    return Math.max(0, Math.min(100, value));
  }
}
