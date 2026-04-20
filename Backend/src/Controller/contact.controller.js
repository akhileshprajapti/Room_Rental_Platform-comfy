const Feedback = require('../Models/contact.model');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASSWORD 
    }
});

exports.createFeedback = async (req, res) => {
    try {
        const { name, contact, message } = req.body;

        if (!name || !contact || !message) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // 1. Save to Database
        const newFeedback = new Feedback({ name, contact, message });
        await newFeedback.save();

        // 2. Admin Notification (To You)
        const adminMailOptions = {
            from: `"${name}" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, 
            replyTo: contact,
            subject: `New Feedback from ${name}`,
            text: `You have received new feedback:\n\nName: ${name}\nContact: ${contact}\nMessage: ${message}`
        };

        // 3. Thank You Message (To User)
        // We check if 'contact' contains an '@' to identify it as an email
        const isEmail = contact.includes('@');
        let userMailOptions = null;

        if (isEmail) {
            userMailOptions = {
                from: process.env.EMAIL_USER,
                to: contact,
                subject: 'Thank you for your feedback!',
                text: `Hi ${name},\n\nThank you for reaching out to us. We have received your message: "${message}"\n\nOur team will get back to you shortly if required.\n\nBest Regards,\nTeam Support`
            };
        }

        // Send Admin Email
        transporter.sendMail(adminMailOptions, (err) => {
            if (err) console.log("Admin Email Error:", err);
        });

        // Send User "Thank You" Email (if contact is an email)
        if (userMailOptions) {
            transporter.sendMail(userMailOptions, (err) => {
                if (err) console.log("User Thank-You Email Error:", err);
            });
        }

        res.status(201).json({ 
            success: true, 
            message: 'Feedback received! A confirmation email has been sent.' 
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};