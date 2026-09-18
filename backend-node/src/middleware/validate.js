import { ZodError } from 'zod';

/**
 * Returns FastAPI-compatible validation errors so the React frontend
 * can read `error.response.data.detail` unchanged.
 */
function formatZodError(error) {
  return error.errors.map((issue) => ({
    type: issue.code,
    loc: ['body', ...issue.path.map(String)],
    msg: issue.message,
    input: issue.received,
  }));
}

export function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(422).json({ detail: formatZodError(error) });
      }
      next(error);
    }
  };
}
