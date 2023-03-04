import {Body, Post, Request, Route, Tags} from "tsoa";
import express from "express";
import {BaseController} from "./base-controller";

const nodemailer = require('nodemailer');

require("dotenv").config();

interface Form {
    name: string
    phone: string
    email: string
    topic: string
    message: string
}

@Route("/api")
export class SupportController extends BaseController {

    private transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_SENDER_ACCOUNT,
            pass: process.env.EMAIL_SENDER_PWD
        }
    })

    constructor() {
        super();
    }

    @Tags("Support")
    @Post("support")
    public async support(@Body() body: Form,
                         @Request() request?: express.Request
    ): Promise<any> {
        try {
            let info = await this.transporter.sendMail({
                sender: body.email,
                to: process.env.EMAIL_RECEIVER_ACCOUNT,
                subject: body.topic,
                text: body.message
            });
            console.log("Message sent: %s", info.messageId);
            return request.res.redirect(process.env.LOGIN_SUPPORT_URL + "?success=true");
        } catch (error) {
            return request.res.redirect(process.env.LOGIN_SUPPORT_URL + "?success=false");
        }
    }

}