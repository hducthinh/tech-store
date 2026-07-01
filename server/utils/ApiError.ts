class ApiError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  errors: any;
  code: any;

  constructor(message, statusCode = 500, errors = null, code = null) {
    if (typeof message === 'object' && message !== null) {
      // Support object payload: new ApiError({ message, status, code, errors })
      const payload = message;
      super(payload.message);
      this.statusCode = payload.status || 500;
      this.status = `${this.statusCode}`.startsWith("4") ? "fail" : "error";
      this.isOperational = true;
      this.errors = payload.errors || null;
      this.code = payload.code || null;
    } else {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
      this.isOperational = true;
      this.errors = errors;
      this.code = code;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;

