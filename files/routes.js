const index = require('../index');
const body_parser = require('body-parser');
const fs = require('fs');
const qns = require("./qns.js")


const url_encoded = body_parser.urlencoded({
    extended: false
})

let next_btn = true, current_page = 0
let current_student = {}

// GETERS

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/warning/:id", (req, res) => {
    current_student[req.params.id] = req.params.id
    fs.readFile('files/students.json', (err, data) => {
        if (err) throw err
        let students = JSON.parse(data).id[req.params.id]
        res.render("warning", {
            name: students.name,
            surname: students.surname,
            id_number: req.params.id
        })
    })
})

app.get("/test/:id", (req, res) => {
    if (current_page !== Object.keys(questions).length) current_page++
    if (current_page === Object.keys(questions).length) next_btn = false

    res.render("test", {
        question: questions[current_page][0][0],
        answer_a: questions[current_page][1][1],
        answer_b: questions[current_page][2][1],
        answer_c: questions[current_page][3][1],
        answer_d: questions[current_page][4][1],
        btn_text: next_btn,
        cur_student: req.params.id
    })
})

app.get("/result/:id", (req, res) => {
    let students = fs.readFileSync("files/students.json")
    let results = fs.readFileSync("files/results.json")
    students = JSON.parse(students)
    results = JSON.parse(results)
    let correct = 0, incorrect = 0, result = 0, obj
    for (let i = 1; i <= Object.keys(questions).length; i++){
        if (questions[i][0][1] === students.id[req.params.id].answers[i]) correct ++
        else incorrect ++
    }
    result = 100 / Object.keys(questions).length * correct
    results.id[req.params.id] = {...results.id[req.params.id],
    ...{correct: correct, incorrect: incorrect, result: result}}
    fs.writeFileSync("files/results.json", JSON.stringify(results, null, 4))

    delete current_student[req.params.id]
    res.render("result", {
        correct: correct,
        incorrect: incorrect,
        result: result
    })
})

app.get("/admin", (req, res) => {
    res.render("admin")
})

app.get("/all_users/4111", (req, res) => {
    let students = fs.readFileSync("files/students.json")
    students = JSON.parse(students)
    let id_numbers = Object.keys(students.id)
    let obj = []
    for (id_number of id_numbers){
        obj.push([id_number, students.id[id_number].name,
                             students.id[id_number].surname])
    }
    res.render("all_users", {
        obj: obj
    })
})

app.get("/somebody/:id", (req, res) => {
    let students = fs.readFileSync("files/students.json")
    students = JSON.parse(students)
    students = students.id[req.params.id].answers
    let colors = []
    let letters = [questions[1][1][0],
                   questions[1][2][0], questions[1][3][0], questions[1][4][0]]
    for (let i = 1; i <= Object.keys(questions).length; i++){
        let x = ["black", "black", "black", "black"]
        if (questions[i][0][1] === students[i]){
            x[letters.indexOf(questions[i][0][1])] = "green"
            colors.push(x)
        } else if (students[i] === ""){
            x[letters.indexOf(questions[i][0][1])] = "black"
            colors.push(x)
        } else {
            x[letters.indexOf(questions[i][0][1])] = "green"
            x[letters.indexOf(students[i])] = "red"
            colors.push(x)
        }
    }
    res.render("somebody", {
        questions: questions,
        colors: colors
    })
})

// POSTERS

app.post("/", url_encoded, (req, res) => {
    let student = {
        name: req.body.name,
        surname: req.body.surname,
        id_number: req.body.id_number
    }

    let students = fs.readFileSync("files/students.json")
    students = JSON.parse(students)
    let obj = {[student.id_number]: {name: student.name,
                                     surname: student.surname,
                                     answers: {}}}
    students.id = {...students.id, ...obj}
    fs.writeFileSync("files/students.json", JSON.stringify(students, null, 4))

    if (student.id_number in current_student) res.status(403).send("Forbidden, because this student has already authorized")
    else res.redirect(301, "/warning/" + student.id_number)
})

app.post("/warning/:id", (req, res) => {
    res.redirect(301, "/test/" + req.params.id)
})

app.post("/test/:id", url_encoded, (req, res) => {
    let students = fs.readFileSync("files/students.json")
    students = JSON.parse(students)
    let answer = req.body.test ? req.body.test : ""
    students.id[req.params.id].answers =
    {...students.id[req.params.id].answers, ...{[current_page]: answer}}
    fs.writeFileSync("files/students.json", JSON.stringify(students, null, 4))

    if (current_page === Object.keys(questions).length) {
        current_page = 0
        next_btn = true
        res.redirect(301, "/result/" + req.params.id)
    } else res.redirect(301, "/test/" + req.params.id)
})

app.post("/admin", url_encoded, (req, res) => {
    let name = req.body.name
    let password = req.body.password
    if (name === "admin" && password == 4111) res.redirect(301, "/all_users/4111")
    else res.redirect(301, "/admin")
})
