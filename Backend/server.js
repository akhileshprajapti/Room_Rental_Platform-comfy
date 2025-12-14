const { default: mongoose } = require("mongoose")
const app = require("./src/app")
const mongodb = require("./src/db/db.js")

mongodb()

app.listen(8080, () => {
  console.log("Server is running on port 8080")
})