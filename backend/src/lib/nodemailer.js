import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'betterreads2006@gmail.com',
        pass: 'vyjggbzriidlolgd'
    }
});

export default transporter;