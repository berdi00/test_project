const express = require("express")


app = express()
app.use(express.static("files"))
app.set("view engine", "ejs")
app.set("views", "files/templates")
module.exports.app = app
const routes = require("./files/routes")

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server listening on port http:/localhost${port}...`)
})
