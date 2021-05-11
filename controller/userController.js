const userModel = require('../model/user');
const authToken = require('../middleware/authToken');
const bcrypt = require('bcrypt');

const Authenticate = async (req, res, next) => {
    try {
        if(!req.body.email || !req.body.password) 
            throw new Error('password and or email not included');

        const email = req.body.email;
        const password = req.body.password;
        const user = await userModel.Get(email);

        if(!user) 
            throw new Error(`User with email ${email} could not be found.`);

        if(!await bcrypt.compare(password, user.password)) 
            return res.status(401).json({message: 'incorrect password'});

        delete user.password;
        req.body.id = user.id;
        authToken.sign(req, res);
        next();
        res.json({message: 'Success!', user: user});
    } 
    catch(err) {
        next(err);
    }
}

// Delets user then returns a success message to client.
const Delete = async (req, res, next) => {
    try {
        const user = await userModel.Get(req.body.id);
        if(!user) 
            throw new Error(`User not found.`);
        
        if(!req.body.password || !await bcrypt.compare(req.body.password, user.password))
            return res.status(401).json({message: "password invalid"});
        
        userModel.Delete(req.body.id);
        next();
    } catch(err) {
        next(err);
    }
}

// Registers a user then returns user to client
const Register = async (req, res, next) => {
    try {
        let user = req.body.user || req.body;

        if(!user.password || !user.email) 
            throw new Error("Password and or email not included");

        user.password = await bcrypt.hash(user.password, 10);
        await userModel.Create(user); 
        user = await userModel.Get(user.email);
        delete user.password;
        res.json({message: "User Registered", user: user});
    } catch(err) {
        next(err);
    }
}

// Updates user then returns new user to client.
const Update = async (req, res, next) => {
      
    try {
        if(!req.body.key || !req.body.value || !req.body.password)
            throw new Error("invalid key, value or password.");
        
        const key = req.body.key;
        const value = req.body.value;
        const id = req.body.id;
        const password = req.body.password;
        
        if(key == 'id' || key == '_id')
            return res.status(400).json({error: "Not permitted to change id of user"});

        const oldUser = await userModel.Get(id);
        if(!oldUser)
            throw new Error('could not find old user');
            
        
        if(!bcrypt.compare(password, oldUser.password))
            return res.status(401).json({error: 'Invalid password'});
        
        
        if(key == 'password')
            value = await bcrypt.hash(value, 10);
            
        await userModel.Update(id, key, value);
        oldUser[key] = value;
        delete oldUser.password;
        res.json({message: "Success!",  user: oldUser});
    } catch(err) {
        next(err);
    }
}

// simply returns user to client; 
const Get = async (req, res, next) => {
    try {
        if(!req.body.id)
            return res.status(401).json({error: "not Authenticated please log in"});
        
        const user = await userModel.Get(req.body.id);
        delete user.password;
        res.json(user);
    } 
    catch(err) {
        next(err)
    }
}

module.exports = {
    Authenticate,
    Register,
    Delete,
    Update,
    Get,
}
