const express= require('express')
const router = express.Router()
const mongoose=require('mongoose')
const User = mongoose.model('User')
const bcrypt= require('bcryptjs')
const jwt=require('jsonwebtoken')
const {JWT_SECRET}=require('../config/keys')
const requirelogin=require('../middleware/requirelogin')

router.get('/protected',requirelogin,(req,res)=>{
    res.send("Hello");
})

router.post('/signup',(req,res)=>{
    const {name,email,password}= req.body
    if(!name||!email||!password)
    {
        return res.status(422).json({error:"Please enter all fields"});
    }
    // return res.json({"message":"Posted Sucessfully"});

    User.findOne({email:email})
    .then((savedUser)=>{
        if(savedUser){
            return res.status(442).json({error:"User already Exists"});
        }
        bcrypt.hash(password,12)
        .then((hashedPassword)=>{
            const user= new User({
                name,
                email,
                password:hashedPassword
            })
    
            user.save()
            .then(()=>{
                res.json({message:"Saved Successfully"});
            })
            .catch((err)=>{
                console.log(err);
            })
        })
        
    })
    .catch((err)=>{
        console.log(err);
    })
})

router.post('/signin',(req,res)=>{
    const {email,password}= req.body
    if(!email||!password)
    {
        return res.status(422).json({error:"Please enter all fields"});
    }

    User.findOne({email:email})
    .then((savedUser)=>{
        if(!savedUser){
            return res.status(442).json({error:"Invalid email or password"});
        }
        bcrypt.compare(password,savedUser.password)
        .then((domatch)=>{
            if(domatch){
                const token=jwt.sign({_id:savedUser._id},JWT_SECRET);
                const {_id,email,name,followers,following,pic}=savedUser;
                res.json({token,user:{_id,email,name,followers,following,pic}});
            }
            else{
                res.json({message:"Saved Successfully"});                }
            })
        .catch((err)=>{
            console.log(err);
        })
        
    })
    .catch((err)=>{
        console.log(err);
    })
})

module.exports=router;