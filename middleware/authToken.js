const jwt = require('jsonwebtoken');


// Loops through blackList and removes invalid tokens. 
const CleanUpBlackList = () => {
    
    for (let i = tokenBlackList.length -1; i >= 0; i--) {
        const token = tokenBlackList[i];
        try {
            jwt.verify(token, process.env.TOKEN_SECRET)
        } catch (err) {
            tokenBlackList.splice(i,1); 
        }        
    }
}

// Verify function returns the data used to sign the token. 
const verify = (req, res, next) => {
    
    authToken = req.header('auth-token'); 
    
    for (let i = 0; i < tokenBlackList.length; i++) {
        const token = tokenBlackList[i];
        if(token == authToken)
        return res.status(401).send('Invalid Token');
    }
    
    try {
        const decodedUser = jwt.verify(authToken, process.env.TOKEN_SECRET);
        req.body.id = decodedUser.id;
        if(!req.body.id) return res.status(401).send('Invalid Token');
        next();
        CleanUpBlackList();
    } 
    catch(err) {
        return res.status(401).send(err);
    }
}

const sign = (req, res, next) => {
    const id = req.body.id;

    if(!id)
        return res.status(400).send('req.body.id needs to be valid in order to sign token');

    const token = jwt.sign({id: id}, process.env.TOKEN_SECRET, {expiresIn: '1d'});
    res.header('auth-token', token);

    if(next) next();
}

const signOut = (req, res, next) => {

    if(req.header('auth-token'));
        tokenBlackList.push(req.header('auth-token')); 


    res.header('auth-token', '');
    next();
}

module.exports = 
{
    verify,
    sign,
    signOut
}