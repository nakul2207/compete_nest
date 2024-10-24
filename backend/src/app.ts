import {config} from "dotenv"
config()

import express, {Request, Response} from "express"
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

const client = new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID as string,
        secretAccessKey: process.env.SECRET_ACCESS_KEY as string
    }
});

async function getObjectURL(key: string){
    const command = new GetObjectCommand({
        Bucket: 'compete-nest',
        Key: key,
    });

    const url = getSignedUrl(client, command);
    return url;
}

app.get("/", async (req:Request, res: Response) =>{
    // const url = await getObjectURL("Problems/sum/input/input_0.txt");
    // console.log(url);

    // res.send(url);
    res.send("Server is running");
})

export default app;