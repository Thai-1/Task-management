const md5 = require("md5");
const User = require("../models/user.model")
const ForgotPassword = require("../models/forgot-passowrd.model")

const generateHelper = require("../../../helpers/generate")
const sendMailHelper = require("../../../helpers/sendMail")


//[POST] /api/v1/users/register
module.exports.register = async (req, res) => {
    req.body.password = md5(req.body.password);

    const existEmail = await User.findOne({
        email: req.body.email,
        deleted: false
    })

    if (existEmail) {
        res.json({
            code: 400,
            message: "email da ton tai"
        })
    }
    else {
        const user = new User({
            fullName: req.body.fullName,
            email: req.body.email,
            password: req.body.password,
            token: generateHelper.generateRandomString(30)
        })
        user.save();
        const token = user.token;

        // gửi cookie từ server về user
        res.cookie("token", token);

        res.json({
            code: 200,
            message: "Thanh cong",
            token: token
        })
    }




}

//[POST] /api/v1/users/login
module.exports.login = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({
        email: email,
        deleted: false
    })

    if (!user) {
        res.json({
            code: 400,
            message: "Khong ton tai email"
        });
        return;
    }
    if (md5(password) !== user.password) {
        res.json({
            code: 400,
            message: "Sai mat khau"
        })
        return;
    }
    const token = user.token;
    res.cookie("token", token);
    res.json({
        code: 200,
        message: "Thanh cong",
        token: token
    })
}

//[POST] /api/v1/users/forgot
module.exports.forgotPassword = async (req, res) => {
    email = req.body.email;

    const user = await User.findOne({
        email: email,
        deleted: false
    })

    if (!user) {
        res.json({
            code: 400,
            message: "email khoong ton tai"
        });
        return;
    }

    const timeExpire = 3;

    const otp = generateHelper.generateRandomNumber(5);

    const objectForgotPassword = {
        email: email,
        otp: otp,
        expireAt: Date.now()
    };

    const forgotPassword = new ForgotPassword(objectForgotPassword);
    await forgotPassword.save();

    // Gửi OTP qua email của user
    const subject = "Ma OTP xac minh lay lai mat khau";
    const html = `MA OTP <b>${otp}<b>. Co han su dung trong ${timeExpire} phut`;

    sendMailHelper.sendMail(email, subject, html);


    res.json({
        code: 200,
        message: "Da gui ma OTP"
    })
}

//[POST] /api/v1/users/password/otp
module.exports.otpPassword = async(req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;

    const result = await ForgotPassword.findOne({
        email: email,
        otp: otp
    })

    if(!result) {
        res.json({
            code:400,
            message: "Ma otp khong hop le"
        });
        return;
    }

    const user = await User.findOne({
        email: email 
    });
    
    const token = user.token;

    res.cookie("token", token);

    res.json({
        code:200,
        message: "Xac thuc thanh cong",
        token: token
    })
}

//[POST] /api/v1/users/reset
module.exports.resetPassword = async(req, res) => {
    const token = req.body.token;
    const password = req.body.password;

    const user = await User.findOne({
        token: token, 
    })

    if(md5(password) === user.password) {
        res.json({
            code:400,
            message: "NHap mat khau khac mat khau cu"
        })
        return; 
    }

    await User.updateOne({
        token: token
    }, {
        password: md5(password)
    })

    res.json({
        code:200
    })
}

//[GET] /api/v1/users/detail
module.exports.detail = async(req, res) => {

    const token = req.cookies.token;

    const user = await User.findOne({
        token: token,
        deleted: false   
    }).select("-password -token")
    
    res.json({
        code: 200,
        info: user
    })
}

