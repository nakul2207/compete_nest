import {config} from "dotenv"
config()
import {Server} from "socket.io"
import http from "http"
import express, {NextFunction, Request, Response} from "express"
import cors from 'cors';
import cookieParser from "cookie-parser"
import problemRouter from "./routes/problem"
import submissionRouter from "./routes/submission"
import companyRouter from "./routes/company"
import topicRouter from "./routes/topic"
import authRouter from "./routes/auth"
import userRouter from "./routes/user"
import contestRouter from "./routes/contest"

const app = express()
const server = http.createServer(app);

// Create Socket.IO instance AFTER creating the server
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"]
    }
});

// Socket.IO connection logic
io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on("join", (uid) => {
        console.log(`Client joined room: ${uid}`);
        socket.join(uid);
    });

    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

const socketMiddleware = (ioInstance: Server) => {
    return (req: Request, res: Response, next: NextFunction) => {
        (req as any).io = ioInstance;
        next();
    };
};

import {ExpressAdapter } from '@bull-board/express'
import {createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
import {contestStartQueue, contestEndQueue} from './bullmq/queues/contestQueues'

const serverAdapter = new ExpressAdapter();

createBullBoard({
    queues: [
        new BullMQAdapter(contestStartQueue),
        new BullMQAdapter(contestEndQueue)
    ],
    serverAdapter,
});

serverAdapter.setBasePath('/admin/queues');

app.use('/admin/queues', serverAdapter.getRouter());

// Middleware and route setup
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser());
app.use(socketMiddleware(io));

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    optionSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use('/api/problem', problemRouter);
app.use('/api/submission', submissionRouter);
app.use('/api/company', companyRouter);
app.use('/api/topic', topicRouter);
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);
app.use('/api/contest', contestRouter);

app.get("/", async (req:Request, res: Response) =>{
    res.send("Server is running");
})

app.put("/callback", async (req:Request, res: Response) =>{
    console.log(req.body);
    res.status(200).json({message: "done"});
})

export {server, io};