import type { NextApiRequest, NextApiResponse } from "next";
import type { Middleware } from "next-connect";

export const setExpires = (res: NextApiResponse, seconds: number): void => {
  res.setHeader("Expires", new Date(Date.now() + seconds).toUTCString());
};

export const createExpirationMiddleware = (
  seconds = 180
): Middleware<NextApiRequest, NextApiResponse> => (_, res, next) => {
  if (process.env.NODE_ENV === "production") {
    setExpires(res, seconds);
  }

  next();
};
