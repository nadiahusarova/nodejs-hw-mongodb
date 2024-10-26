import createError from "http-errors";

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const message = error.details[0].message;
      next(createError(400, message));
    } else {
      next();
    }
  };
};

export default validateBody;