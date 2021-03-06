const express= require('express')
const router = express.Router()
const mongoose=require('mongoose')
const requirelogin=require('../middleware/requirelogin')
const Post = mongoose.model("Post")

router.get('/allpost',(req,res)=>{
    Post.find()
    .populate("postedby","_id name pic")
    .populate("comments.postedby","_id name")
    .then(posts=>{res.json({posts})})
    .catch(err=>{console.log(err)});
})
router.get('/mypost',requirelogin,(req,res)=>{
    Post.find({postedby:req.user._id})
    .populate("postedby","_id name pic")
    .then(mypost=>{res.json({mypost})})
    .catch(err=>{console.log(err)});
})

router.post('/createpost',requirelogin,(req,res)=>{
    const {title,body,pic}=req.body
    if(!title||!body||!pic){
        return res.status(422).json({error:"Please enter all the fields"});
    }
    req.user.password=undefined;
    const post=new Post({
        title,
        body,
        photo:pic,
        postedby:req.user
    })
    post.save().then(result=>{
        res.json({post:result});
    }).catch(err=>{
        console.log(err);
    })
})

router.put('/likes',requirelogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,
        {$push:{likes:req.user._id}},
        {new:true}).populate("postedby","_id name pic").populate("comments.postedby","_id name pic")
        .exec((err,result)=>{
            if(err){
                return res.status(422).json({error:err});
            }
            else{
                return res.json(result);
            }
        })
})
router.put('/dislikes',requirelogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,
        {$pull:{likes:req.user._id}},
        {new:true}).populate("postedby","_id name pic").populate("comments.postedby","_id name pic")
        .exec((err,result)=>{
            if(err){
                return res.status(422).json({error:err});
            }
            else{
                return res.json(result);
            }
        })
})
router.put('/comments',requirelogin,(req,res)=>{
    const comment={
        text:req.body.text,
        postedby:req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId,
        {$push:{comments:comment}},
        {new:true}).populate("comments.postedby","_id name pic")
        .populate("postedby","_id name pic")
        .exec((err,result)=>{
            if(err){
                return res.status(422).json({error:err});
            }
            else{
                return res.json(result);
            }
        })
})

router.delete('/deletepost/:postId',requirelogin,(req,res)=>{
    Post.findOne({_id:req.params.postId})
    .populate("postedby","_id")
    .exec((err,post)=>{
        if(err || !post){
            return res.status(422).json({error:err})
        }
        if(post.postedby._id.toString() === req.user._id.toString()){
              post.remove()
              .then(result=>{
                  res.json(result)
              }).catch(err=>{
                  console.log(err)
              })
        }
    })
})
module.exports=router;