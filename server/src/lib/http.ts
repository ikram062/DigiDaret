/** An error whose message is safe to show the user. Thrown from routes, caught by the error handler. */
export class HttpError extends Error {
  status: number;
  fieldErrors?: Record<string, string[]>;
  constructor(status: number, message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export const badRequest = (m: string, f?: Record<string, string[]>) => new HttpError(400, m, f);
export const forbidden = (m: string) => new HttpError(403, m);
export const notFound = (m = "Not found.") => new HttpError(404, m);
export const conflict = (m: string) => new HttpError(409, m);
