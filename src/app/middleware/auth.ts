import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import jwt, { JwtPayload } from "jsonwebtoken";
import { TUserRole } from "../modules/user/user-interface";
import config from "../config";

const auth = (...requiredRole: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "You have no access to this route",
      });
    }

    const token = authHeader.split(" ")[1];

    // Check if the token  is valid
    jwt.verify(token, config.jwt_access_screet as string, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: "You have no access to this route",
        });
      }

      const role = (decoded as JwtPayload).role;
      if (requiredRole.length && !requiredRole.includes(role)) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: "You have no access to this route",
        });
      }
      req.user = decoded as JwtPayload;
      next();
    });
  });
};

export default auth;
