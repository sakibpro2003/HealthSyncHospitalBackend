import type { Response } from "express";

type TMeta = {
  limit: number;
  page: number;
  total: number;
  totalPage: number;
};
type TReseponse<T> = {
  statusCode: number;
  message?: string;
  success: boolean;
  meta?: TMeta;
  data: T;
};

export const sendResponse = <T>(res: Response, data: TReseponse<T>) => {
  res.status(data?.statusCode).json({
    success: data.success,
    message: data.message,
    meta: data.meta,
    data: data.data,
  });
};
