const User = require('../models/user');
const jwt = require('jsonwebtoken');
const shortid = require('shortid');

const signup = (req, res) => {
    User.findOne({ email: req.body.email })
        .exec((error, user) => {
            // If user already exists
            if (error) return res.status(400).json({ msg: `Something went wrong`, error });
            if (user) return res.status(400).json({ msg: 'User already exits' });

            // If new user trys to login
            const { firstName, lastName, email, password, contactNumber } = req.body;
            const _user = new User({
                firstName, lastName, email, password, contactNumber,
                username: shortid.generate(), role: 'dealer'
            })

            _user.save((error, data) => {
                if (error) return res.status(400).json({ msg: `Something went wrong`, error });
                if (data) return res.status(400).json({ msg: 'User Successfully register !!' });
            })
        })
}

const signin = (req, res) => {
    User.findOne({ email: req.body.email })
        .exec((error, user) => {
            if (error) return res.status(400).json({ msg: `Something went wrong`, error });
            if (user) {
                if (user.authenticate(req.body.password) && user.role === 'dealer') {
                    const token = jwt.sign(
                        { id: user._id, role: user.role },
                        process.env.jwt_secret,
                        { expiresIn: '2h' }
                    )
                    const { _id, firstName, lastName, email, role, fullName, username, contactNumber } = user;
                    res.status(200).json({
                        token,
                        user: {
                            _id, firstName, lastName, email, role, fullName, username, contactNumber
                        }
                    })
                } else {
                    return res.status(400).json({ msg: `Invalid Password` })
                }
            }
        })
}

const DealerProfile = (req, res) => {
    const { userId } = req.params;
    if (userId) {
        User.findById({ _id: userId })
            .exec((error, _dealer) => {
                if (error) return res.status(400).json({ msg: `Something went wrong`, error });
                if (_dealer) return res.status(200).json({ _dealer });
            })
    } else {
        return res.status(404).json({ msg: `Dealer dosen't exits` });
    }
}

module.exports = {
    signup,
    signin,
    DealerProfile
}