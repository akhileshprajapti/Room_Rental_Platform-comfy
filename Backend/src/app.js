const express = require("express")
const dotenv = require("dotenv")
dotenv.config()
const app = express()
const cookieParser = require("cookie-parser")
const authUserRouter = require("./Router/AuthUser.route")
const AdminRouter = require("./Router/Admin.route")
const ListingRouter = require("./Router/Listing.route")
const BookingRouter = require("./Router/Booking.route");
const ContactRouter = require("./Router/contact.route")
const InvoiceRouter = require("./Router/Invoice.route")
const cors = require("cors")    

app.use(cors({
    origin: "https://room-rental-platform-comfy-frontend.onrender.com",
    credentials: true
}))



app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("Hello World")
})

app.use("/api/v1/user", authUserRouter )
app.use("/api/v1/admin", AdminRouter)
app.use("/api/v1/listing", ListingRouter)

<<<<<<< HEAD
app.use("/api/v1/booking", BookingRouter);
app.use("/api/v1/contact", ContactRouter);
app.use("/api/v1/invoice", InvoiceRouter);

module.exports = app
=======
module.exports = app
>>>>>>> 8d1e927e12a5955da5936a38d9e25ea12b128822
