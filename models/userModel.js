const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const  bcrypt= require('bcrypt');
const UserSchema = new mongoose.Schema( { 

name: {
    type:String,
    required: [true,'Name is required']
},
email : {
    type: String,
    required: [true , 'Email is required'],
    unique: true ,
    lowercase: true,
    validate :[validator.isEmail , 'Enter a valid email']
},
photo : {
   type:String
},
role : {
    type : String,
    enum : ['user','guide', 'lead-guide' , 'admin'],
    default : 'user',
},
password :{
   type: String,
   required:[true,'Password is required'],
   minLength: 8,
   select: false,
},
passwordConfirm : {
    type: String,
    required: [true,'Confirm Pasword is required'],
    validate: {
        validator: function (el) {
            return el === this.password
        },
        message: 'PasswordConfirm should match the Password'
    },
},
passwordUpdatedAt :{
    type : Date,
    default: Date.now()
} ,
passwordResetToken : String,
passwordResetExpires: Date,
active : {
    type : Boolean,
    default: true,
    select: false
}

});
// middleware methods (only for save and created)
UserSchema.pre('save', async function(next) {
    //run only if password is modified
    if (!this.isModified('password')) return next();

    //hash the password with cost 12
    this.password = await bcrypt.hash(this.password , 12);

    //by adding undefined , the field is not persisted in db
    this.passwordConfirm = undefined;
    next();
});

UserSchema.pre('save', function(next) {
   if(!this.isModified('password') || this.iNew ) return next();
   this.passwordUpdatedAt= Date.now()- 1000;
   next();
});

//query middlware
UserSchema.pre(/^find/, function (next) {
  this.find({ active : true});
  next();
});
UserSchema.methods.checkPassword = async function (candidatePw , userPassword) {
    return await bcrypt.compare(candidatePw, userPassword);
}

UserSchema.methods.changedPassword = function (JWTTimestamp) {
    if (this.passwordUpdatedAt ) {
       const changedTimestamp = parseInt(this.passwordUpdatedAt.getTime()/1000, 10);
       return JWTTimestamp < changedTimestamp;
    }
    return false;
}

UserSchema.methods.createPasswordResetToken = function () {

  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  
  this.passwordResetExpires  = Date.now() + 10 * 60 * 1000;
  return resetToken;

}

const User = mongoose.model('User' , UserSchema);

module.exports = User;