type ApiErrorShape = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export function getApiErrorMessage(err: unknown, fallback: string): string {
  const e = err as ApiErrorShape;
  return e?.response?.data?.message || fallback;
}


