export type Result = {
  ok: boolean;
  message: string;
};

export const okResult = (message: string): Result => ({ ok: true, message });
export const errorResult = (message: string): Result => ({ ok: false, message });
