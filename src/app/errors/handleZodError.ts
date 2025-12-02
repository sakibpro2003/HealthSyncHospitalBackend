import { ZodError, type ZodIssue } from "zod"; //maybe not type zodIssue
import {
  type TErrorSources,
  type TGenericErrorResponse,
} from "../interface/error";

const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const errorSources: TErrorSources = err.issues.map((issue: ZodIssue) => {
    return {
      path: issue?.path[issue.path.length - 1] ?? "unknown",
      message: issue.message,
    };
  });

  const statusCode = 400;

  return {
    statusCode,
    message: "Validation Error",
    errorSources,
  };
};

export default handleZodError;
