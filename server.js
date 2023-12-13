const mongoose= require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path :'./config.env'});

const app = require('./index');

const DB = process.env.DATABASE;
mongoose.connect(DB ,{
     useNewUrlParser: true,
     useCreateIndex : true,
     useFindAndModify : false
}).then(() => {
     console.log('DB connected successfully')
});


const port = process.env.PORT;
app.listen(port, () =>{
     console.log(`App running on port ${port}`)
});

