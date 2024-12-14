// middlewares/socketMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { Server } from "socket.io";

const socketMiddleware = (ioInstance: Server) => {
    return (req: Request, res: Response, next: NextFunction) => {
        (req as any).io = ioInstance;
        next();
    };
};

export default socketMiddleware;