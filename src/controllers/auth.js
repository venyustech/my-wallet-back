import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import db from "../db.js"

const singUpSchema = joi.object({
    name: joi.string().trim().lowercase().required(),
    email: joi.string().email().trim().required(),
    password: joi.string().trim().required()
});

const loginSchema = joi.object({
    email: joi.string().email().trim().required(),
    password: joi.string().trim().required()

})


export async function signUp(req, res) {
    const user = req.body;

    const validation = singUpSchema.validate(user, { abortEarly: false });

    if (validation.error) {
        const errorsFind = validation.error.details.map((detail) => detail.message);

        return res.status(422).send(errorsFind);
    }

    try {
        const thereIsEmail = await db.collection("users").findOne({ email: user.email })

        if (thereIsEmail)
            return res.sendStatus(409);
        const passworHash = bcrypt.hashSync(user.password, 10)

        await db.collection("users").insertOne({ ...user, password: passworHash });

        res.sendStatus(200);

    } catch (error) {
        res.status(500).send(error)
    }
}

export async function login(req, res) {
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


}