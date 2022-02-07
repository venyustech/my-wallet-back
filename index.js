import express, { json } from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dayjs from "dayjs";
import "dayjs/locale/pt-br.js";
import joi from "joi";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
dotenv.config();


const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
    db = mongoClient.db("mywallet");
})

const server = express();
server.use(json());
server.use(cors());

const singUpSchema = joi.object({
    name: joi.string().trim().lowercase().required(),
    email: joi.string().email().trim().required(),
    password: joi.string().trim().required()
});

const loginSchema = joi.object({
    email: joi.string().email().trim().required(),
    password: joi.string().trim().required()

})


server.post("/sign-up", async (req, res) => {
    const user = req.body;

    const validation = singUpSchema.validate(user, { abortEarly: false });

    if (validation.error) {
        const errosFind = validation.error.details.map((detail) => detail.message);

        return res.status(422).send(errors);
    }

    try {
        const thereIsEmail = await db.collection("users").findOne({ email: user.email })

        if (thereIsEmail)
            return res.sendStatus(409);
        const passworHash = bcrypt.hashSync(user.password, 10)

        await db.collection("users").insertOne({ ...user, password: passworHash });

        res.sendStatus(200);

    } catch (error) {
        res.status(500).send(newUser)
    }


});

server.post("/login", async (req, res) => {

    const { email, password } = req.body;

    const validation = loginSchema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map((answer) => answer.message);
        return res.status(422).send(errors);
    }
    try {
        const user = await db.collection("users").findOne({ email });
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = uuid();

            await db.collection("sessions").insertOne({
                token: token,
                userId: user._id
            });

            res.send({
                token: token,
                name: user.name
            });
        } else {
            res.sendStatus(401);
        }
    } catch (error) {
        res.status(500).send(error);
    }

});

server.listen(5000, () => console.log("Server in http://localhost:5000/"))
