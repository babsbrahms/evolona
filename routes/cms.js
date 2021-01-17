var express = require('express');
var router = express.Router();
var multer = require('multer');
var mongoose = require('mongoose');
var crypto = require('crypto');
var path = require('path');
var GridFsStorage = require('multer-gridfs-storage');
var Grid = require('gridfs-stream');
var Product = require('../model/product');
var Order = require('../model/order');


// MONGODB URI
//REMEBER TO CHANGE EVN 
var mongoURI= "";
var env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    mongoURI = process.env.DBdev;
} else {
    mongoURI = process.env.DB;
}
console.log("mongoURI: ", mongoURI);

// mongoose connection
const promise = mongoose.connect(mongoURI, { useNewUrlParser: true });

const conn = mongoose.connection;


// Init gfs 
let gfs;

conn.once('open',  ()=> {
  gfs = Grid(conn.db, mongoose.mongo);

  gfs.collection('uploads')
})



// create storaege engine (multer-gridfs-storage)
const storage = new GridFsStorage({
    //   url: mongoURI,
    db: promise,

  file: (req, file) => new Promise((resolve, reject) => {

            // bucketName === collectionName === 'uploades'
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                filename,
                bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
      
    })
  

});
const productImage = multer({ storage }).array('pictures');




// var productStorage = multer.diskStorage({
//     destination: "./public/images/",
//     filename : function(req, file, cb){
//       cb(null, file.fieldname+'-'+Date.now()+path.extname(file.originalname))
//     }
//   })
  
//   var productImage = multer({
//     storage : productStorage,
//     fileFilter : function(req, file, cb){
//      var acceptable = /jpeg|png|jpg|gif/;
  
//      var filetype = acceptable.test(path.extname(file.originalname));
//      var mimetype = acceptable.test(file.mimetype)
//      if(filetype && mimetype){
//        cb(null, true)
//      }else{
//        cb('Error: The acceptable image types are jpeg, png, jpg and gif', false)
//      }
//     }
//   }).array('pictures');




// cms login
router.get('/', function(req, res){
    
    res.render('cms', { page: ' | CMS' })
})

router.post('/sign_in', function(req, res) {
    req.session.admin = req.body.token;
    // console.log(req.body);
    if (req.session.admin) {
        res.status(200).send('done')
    } else {
        res.status(400).send('error')
       
    }  
})

router.get('/sign_out', function(req, res) {
    req.session.admin = undefined;
    res.redirect('/cms')
})

router.get("/images/:filename", (req, res)=>{
    // gfs.files.find
    gfs.files.findOne({filename: req.params.filename}, (err, file)=>{
        if(err){
            res.status(404).json({err: 'Can\'t find your image'})
        }else if(!file){
            res.status(404).json({err: 'Can\'t find your image'})
        } else if(file){
            const fileStream = gfs.createReadStream(file)
            fileStream.pipe(res)
        }

    })
})

// there is cookies but no session


// auth middleware
router.use(function (req, res, next){
    if(req.session.admin == undefined) {
        res.redirect('/cms')
    } else {
        next()
    }
})

// add product
router.get('/add-new', function(req, res){
    res.render('cms-add-new')
})


// post add product
router.post('/add-new', function(req, res){
    var {name, S, M, L, XL, tags, description, price, imgs} = req.body;
    
    console.log({ name, S, M, L, XL, tags, description, price, imgs });
    

    // var imgs = pictures.map((pics) => `/cms/images/${pics.filename}`)
    // var imgs = pictures.map((pics) => `/images/${pics.filename}`)
    // console.log(imgs);
    
    var sizes = []
    if (Number(S) > 0) {
        sizes.push({ size: 'S', qty: Number(S)})
    }

    if (Number(M) > 0) {
        sizes.push({ size: 'M', qty: Number(M)})
    }

    if (Number(L) > 0) {
        sizes.push({ size: 'L', qty: Number(L)})
    }

    if (Number(XL) > 0) {
        sizes.push({ size: 'XL', qty: Number(XL)})
    }

    Product.create({ 
        name,
        sizes,
        tags: tags.split(','),
        description,
        price,
        pictures: imgs

    })
    .then(() => {
        res.redirect('/cms/product-list')
    })
    .catch(() => {
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        res.render('error', { page: ' | CMS', message: 'Problem adding product'})
    })
})


// open edit page
router.get('/edit/:id', function(req, res){
    var id = req.params.id
    // console.log(id);

    Product.findOne({ _id: id}, function(err, product) {
        
        if (err) {
            res.locals.error = req.app.get('env') === 'development' ? err : {};
            res.render('error', { page: ' | CMS', message: 'Product not found'})
        } else if (product == null) {
            res.locals.error = req.app.get('env') === 'development' ? {} : {};
            res.render('error', { page: ' | CMS', message: 'Product not found'})
        }else {
            
            res.render('cms-edit', { product })
        }
    }) 
})


// submit edit
router.post('/edit', function(req, res){
    var {name, S, M, L, XL, tags, description, price, _id, OldPics, imgs } = req.body;
  //  var pictures = req.files;

   // var imgs = pictures.map((pics) => `/cms/images/${pics.filename}`)
    // var imgs = pictures.map((pics) => `/images/${pics.filename}`)
    
    
    var sizes = []
    if (Number(S) > 0) {
        sizes.push({ size: 'S', qty: Number(S)})
    }

    if (Number(M) > 0) {
        sizes.push({ size: 'M', qty: Number(M)})
    }

    if (Number(L) > 0) {
        sizes.push({ size: 'L', qty: Number(L)})
    }

    if (Number(XL) > 0) {
        sizes.push({ size: 'XL', qty: Number(XL)})
    }

    Product.updateOne({ _id }, { 
        name,
        sizes,
        tags: tags.split(','),
        description,
        price,
        pictures: imgs.length > 0? imgs: OldPics.split(",")

    }, function(err) {
        if (err) {
            res.locals.error = req.app.get('env') === 'development' ? err : {};
            res.render('error', { page: ' | CMS', message: 'Problem adding product'})
        } else {
            res.redirect('/cms/product-list')
        }
    })
   
})



router.get('/order-page/:id', function(req, res){
    var id = req.params.id

    
    Order.findOne({ _id: id }, function(err, order) {
       
        if (err) {
            res.locals.error = req.app.get('env') === 'development' ? err : {};
            res.render('error', { page: ' | CMS', message: 'Order not found'})
        } else if (order == null) {
            res.locals.error = req.app.get('env') === 'development' ? {} : {};
            res.render('error', { page: ' | CMS', message: 'Order not found'})
        }else {
            
            
            res.render('cms-order-page', { order })
        }
    })
    
})


// list orders 
router.get('/orders', function(req, res){
    const {nav} = req.query;
    let current = req.session.blog_number || 0;
    if (nav === 'previous' && (current !== 0) ) {
      current = current - 1;
    } else if (nav === 'next') {
      current = current + 1;
    } 
  
    req.session.blog_number = current;
    let limit = 25;
    let skip = limit*current;

    Order.find({}).sort({ _id: -1}).skip(skip).limit(limit).exec(function(err, orders) {
        if (err) {
            res.locals.error = req.app.get('env') === 'development' ? err : {};
            res.render('error', { page: ' | CMS', message: 'Orders not found'})
        } else {
            res.render('cms-orders', { orders, current_number: current, limit})
        }
    })
    
})


// change order status
router.post('/order/status', function(req, res) {
    const { _id, status} = req.body;
    Order.findByIdAndUpdate(_id, { $set: { status: status }}, function(err, order) {
        if (err) {
            res.status(400).send({ msg: 'Problem updating order status'})
        } else {
            res.status(200).send({ msg: 'Done'})
        }
    })
})


// delete order
router.delete('/order_remove/:id', function(req, res) {
    var id = req.params.id;
    // console.log(id);
    Order.remove({ _id: id }, function(err, done){
        if(err) {
            res.status(404).send({ msg: 'Problem deleting product'})
        } else {
            res.status(200).send({ msg: 'Product successfullly deleted'}) 
        }
    })
})


// list products √
router.get('/product-list', function(req, res){
    const {nav} = req.query;
    let current = req.session.blog_number || 0;
    if (nav === 'previous' && (current !== 0) ) {
      current = current - 1;
    } else if (nav === 'next') {
      current = current + 1;
    } 
  
    req.session.blog_number = current;
    let limit = 25;
    let skip = limit*current;
    Product.find({}).sort({ _id: -1}).skip(skip).limit(limit).exec(function(err, products) {
        if (err) {
            res.locals.error = req.app.get('env') === 'development' ? err : {};
            res.render('error', { page: ' | CMS', message: 'Products not found'})
        } else {
            res.render('cms-pro-list', { products, current_number: current, limit })
        }
    })  
})

// delete product (REMEMBER TO DELETE PICTURE)
router.delete('/product/:id',  function(req, res) {
    var id = req.params.id;
    // console.log(id);
    Product.remove({ _id: id }, function(err, done){
        if(err) {
            res.status(404).send({ msg: 'Problem deleting product'})
        } else {
            res.status(200).send({ msg: 'Product successfullly deleted'}) 
        }
    })
})




module.exports = router;


// router.post("/upload_image", upload.single('image'),authUser, (req, res)=>{
//     const email = res.token.email;
    
//     User.findOne({email})
//     .then(user=>{
//         if(user.profile && user.profile.filename){
//             gfs.exist({filename: user.profile.filename, root: 'uploads'}, (err, exist)=>{
//                 if(err){
//                     res.status(400).json( {errors: {global: "Error in profile image upload"}}) 
//                 }else if(exist){
//                     gfs.remove({_id: user.profile.fileId, root: 'uploads'},(errs)=>{
//                         if(errs){
//                             res.status(400).json({err: 'Error deleting previous profile pics'})            
//                         }
//                     })
//                 }
//             })
//         }
    
//     })
//     .then(() => uploadImage(email,req.file, res))
//     .catch(()=> res.status(404).json( {errors: {global: "Error uploading your profile"}}) ) 
// })



