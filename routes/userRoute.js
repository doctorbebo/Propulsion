const express = require('express');
const authToken = require('../middleware/authToken');
const {Register, Authenticate, Update, Delete, Get} = require('../controller/userController');

const router = express.Router();


router.post('/register', Register);

router.post('/login', Authenticate, authToken.sign);

router.post('/logout', authToken.signOut, (req, res) => res.json({message: 'logout successful'}));

router.put('/update', authToken.verify, Update);

router.delete('/delete', authToken.verify, Delete, authToken.signOut, (req, res) => res.json({message: 'user has been deleted'}));

router.get('/', authToken.verify, Get);

router.use((err, req, res, next) => {
    console.log(`ERROR: ${err.message} \n ${err.stack}`);
    res.status(400);
    res.json({
        message: err.message,
    });    
  })

module.exports = router;