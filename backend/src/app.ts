import {config} from "dotenv"
config()

import express, {Request, Response} from "express"
const app = express()
import cors from 'cors';

import problemRouter from "./routes/problem"
import submissionRouter from "./routes/submission"

app.use(express.json())
app.use(express.urlencoded({extended: true}))
// Configure CORS with credentials
const corsOptions = {
    origin: process.env.FRONTEND_URL, // Replace with your frontend URL
    credentials: true, // Allow requests with credentials (cookies)
    optionSuccessStatus: 200 // Some legacy browsers may require this
}

app.use(cors(corsOptions));

app.use('/api/problem', problemRouter);
app.use('/api/submission', submissionRouter);

app.get("/", async (req:Request, res: Response) =>{
    // const url = await getObjectURL("Problems/sum/input/input_0.txt");
    // console.log(url);

    // res.send(url);
    res.send("Server is running");
})

app.put('/submitted_testcase/:id',async (req:Request, res: Response) =>{
    console.log(req.params.id);
    console.log('Judge0 callback received:', req.body);
    res.sendStatus(200); // Respond to Judge0 that we received the callback
})

export default app;