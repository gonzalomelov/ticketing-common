import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { CustomError } from '../errors/custom-error';

export interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser: UserPayload | null;
    }
  }
}

export const currentUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.jwt) {
    req.currentUser = null;
    return next();
  }

  try {
    const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayload;
    req.currentUser = payload;
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
      if (err instanceof CustomError) {
        console.log(err.serializeErrors());
      }
    } else {
      console.log('Unknown error');
    }
    req.currentUser = null;
  }

  next();
}