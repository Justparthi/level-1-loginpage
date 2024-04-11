import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";


const app = express();
const port = 5000;
const saltRounds = 10


const db = new pg.Client({
    user : "postgres",
    host : "localhost",
    database : "login",
    password : "Parthi",
    port : 5432
})


db.connect();




app.use(bodyParser.urlencoded({ extended: true}))
app.use(express.static("public"))

app.get("/secrets", async (req,res) =>{

    res.render("home.ejs")

})

app.get("/signup", (req,res) =>{

    try {
        res.render("signup.ejs")
    } catch (err) {
        console.log(err)
    }

    
})


app.get("/", (req, res) =>{
    res.render("login.ejs")
})

app.post("/signup", async (req,res) =>{


    const choice = req.body.mailid
    const mailid = req.body.mailid
    const pass = req.body.pass
    
    try {
        const result = await db.query('SELECT username FROM userinfo WHERE username = $1', [choice])

    if (result.rows.length > 0) {
        res.send("Username or email Already taken !!!")
    }  else {
        bcrypt.hash(pass, saltRounds, async (err, hash) => {
            if (err){
                console.log(`Error hashing password ${err}`)
            } else {
                const result = db.query("INSERT INTO userinfo (username, password) VALUES ($1, $2)", [mailid, hash])
        // console.log(result)
        res.redirect("/")
            }
        })
        
    }

    } catch (err) {
        console.log(err)
        res.render("error")
        console.log("user details dosnt exists")
        res.send("User details already exist")

        
    } 
    

//     try {
//         const mailid = req.body.mailid
//         const pass = req.body.pass
//         const result = db.query("INSERT INTO userinfo (username, password) VALUES ($1, $2)", [mailid, pass])
//         res.redirect("/")
//     } catch (err) {
//         res.send("Username already exists") 
//         console.log(err)  
//     } finally {
//         res.send("Useername already exists")
//     }

    
})

app.post('/', async (req, res) => {

    const email = req.body.mailid
    const loginPassword = req.body.password

    try {
        const data = await db.query("SELECT * FROM userinfo WHERE (username) = $1", [email])
        
        
        if (data.rows.length > 0) {

        const pass = data.rows[0]
        const saltedPassword = pass.password

        bcrypt.compare(loginPassword, saltedPassword, (err, result) =>{
        if (err) {
        
            console.log(`Error comparing passwords ${err}`)
        }
        else {
            if (result) {
                res.render("home.ejs")
            } else {
                res.send("incorrect password")
            }
        }
        
        })

            // res.redirect("/secrets")
            
        } else {
            res.send("Something went wrong please check the password")
            
        }

    } catch (err) {
        console.log(err)
        
    }


























    // const { email, password } = req.body;
    // // try {
    //     const result = await db.query('SELECT * FROM userinfo WHERE email = $1 AND password = $2', [email, password]);
    //     const user = result.rows[0];
    //     if (user) {
    //         res.redirect('/error');
    //     } else {
    //         res.send('Incorrect email or password');
    //     }
    // } catch (error) {
    //     console.error('Error executing query', error);
    //     res.status(500).send('Internal Server Error');
    // }
});



app.listen(port, () =>{
    console.log(`The Server is running on port ${port}`)
})





