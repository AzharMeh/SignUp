const express = require('express');
const cors = require('cors');
const app = express();
const port = 1300;
const dbConnect = require('./dbconfig')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config()
app.use(cors());
app.use(express.json());
const USER = require('./dbModel')
dbConnect()

app.post('/signup',async(req, res)=>{
    console.log('signup api hitted')
    try {
        console.log('data sent by signup page', req.body)
        const { username, email, password } = req.body;
        
        if(!username) res.send({message:"Username required", isError:true})
        if(!email) return res.send({message:"Email is required",isError:true})
        if (!password) return res.send({ message: "Password is required",isError:true })
        
        const existingUser = await USER.findOne({ email })
        if (existingUser) return res.send({ message: "User already exists",isError:true});
                        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new USER({ username, email, password: hashedPassword, token:null })  
        await newUser.save()
        res.send({message:'User registered Successfully', data:newUser, isError:false})
    } 
    catch (err) {
        res.send({message:'data not stored', error: err.message, isError:true})
    }
})

app.post('/login', async(req, res)=>{
    console.log('Login api hitted')
    console.log('data sent by signup page', req.body)
    try {
        const {username, email, password} = req.body;
        if(!username || !email || !password) {
            return res.send({message:"Please fill all the fields"})
        }

        const existingUser = await USER.findOne({ email })
        // console.log("existing user is", existingUser)        
        if (!existingUser)  return res.send({ message: "User not found" })
        
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if(!isMatch) return res.send({ message: "Invalid password" })

        const token = await jwt.sign({email, username}, process.env.MY_KEY, {expiresIn:'1h'})
        // console.log('token is', token) 
        existingUser.token = token;
        await existingUser.save();        
        // console.log('existing user with token is', existingUser) 
        res.send({message:'successful', token})
    } 
    catch (err) {
        res.send({message:'data not stored', error: err.message})
    }
})

app.post('/verify', async(req,res)=>{
    const token = req.body.token
    try {
        const tokenUser = await jwt.verify(token,process.env.MY_KEY)
        console.log("token user is : ",tokenUser)
        res.send({message:'user verified token : ', tokenUser})

    } catch (error) {
        res.send(error)
    }
})



app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});