import {config} from "dotenv"
config()
import {Server} from "socket.io"
import http from "http"
import express, {NextFunction, Request, Response} from "express"
import cors from 'cors';
import problemRouter from "./routes/problem"
import submissionRouter from "./routes/submission"

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

// Middleware and route setup
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(socketMiddleware(io));

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    optionSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use('/api/problem', problemRouter);
app.use('/api/submission', submissionRouter);

app.get("/", async (req:Request, res: Response) =>{
    res.send("Server is running");
})

export {server, io};