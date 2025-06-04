import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import config from '../../../../../../Course/PH/L2/SignatureMart/NextMart-Server/src/app/config';
import { UserRole } from '../../../../../../Course/PH/L2/SignatureMart/NextMart-Server/src/app/modules/user/user.interface';
import AppError from '../../../../../../Course/PH/L2/SignatureMart/NextMart-Server/src/app/errors/appError';
import catchAsync from '../../../../../../Course/PH/L2/SignatureMart/NextMart-Server/src/app/utils/catchAsync';
import { StatusCodes } from 'http-status-codes';
import User from '../../../../../../Course/PH/L2/SignatureMart/NextMart-Server/src/app/modules/user/user.model';

const auth = (...requiredRoles: UserRole[]) => {
   return catchAsync(
      async (req: Request, res: Response, next: NextFunction) => {
         const token = req.headers.authorization;

         if (!token) {
            throw new AppError(
               StatusCodes.UNAUTHORIZED,
               'You are not authorized!'
            );
         }

         try {
            const decoded = jwt.verify(
               token,
               config.jwt_access_secret as string
            ) as JwtPayload;

            const { role, email } = decoded;

            const user = await User.findOne({ email, role, isActive: true });

            if (!user) {
               throw new AppError(
                  StatusCodes.NOT_FOUND,
                  'This user is not found!'
               );
            }

            if (requiredRoles && !requiredRoles.includes(role)) {
               throw new AppError(
                  StatusCodes.UNAUTHORIZED,
                  'You are not authorized!'
               );
            }

            req.user = decoded as JwtPayload & { role: string };
            next();
         } catch (error) {
            if (error instanceof TokenExpiredError) {
               return next(
                  new AppError(
                     StatusCodes.UNAUTHORIZED,
                     'Token has expired! Please login again.'
                  )
               );
            }
            return next(
               new AppError(StatusCodes.UNAUTHORIZED, 'Invalid token!')
            );
         }
      }
   );
};

export default auth;
