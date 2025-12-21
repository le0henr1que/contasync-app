/**
 * Fetcher otimizado para SWR
 * Lida com autenticação, headers e erro handling
 */

export class FetchError extends Error {
  status: number;
  info: any;

  constructor(message: string, status: number, info: any) {
    super(message);
    this.status = status;
    this.info = info;
  }
}

export const fetcher = async <T = any>(url: string): Promise<T> => {
  const token = localStorage.getItem('accessToken');

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new FetchError(
      error.message || 'Erro ao buscar dados',
      res.status,
      error
    );
  }

  return res.json();
};

export const fetcherWithBody = async <T = any>(
  url: string,
  { arg }: { arg: { method?: string; body?: any } }
): Promise<T> => {
  const token = localStorage.getItem('accessToken');

  const res = await fetch(url, {
    method: arg.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(arg.body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new FetchError(
      error.message || 'Erro na requisição',
      res.status,
      error
    );
  }

  return res.json();
};
