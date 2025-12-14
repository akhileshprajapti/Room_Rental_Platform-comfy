const express = require("express")
const dotenv = require("dotenv")
dotenv.config()
const app = express()
const cookieParser = require("cookie-parser")
const authUserRouter = require("./Router/AuthUser.route")
const AdminRouter = require("./Router/Admin.route")
const ListingRouter = require("./Router/Listing.route")
const cors = require("cors")    

app.use(cors({
    origin: "http://localhost:5173",
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

module.exports = app