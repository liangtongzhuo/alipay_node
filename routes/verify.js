'use strict';
const router = require('express').Router();
const fs = require('fs');
const crypto = require('crypto');

//返回 验证---------------------------------------------------
router.post('/verify', function (req, res) {
    // router.get('/return', function(req, res) {
    ///验证签名
    if (!RSAVerify(req.body)) {
        console.log('验证签名失败');
        res.end('error')
        return //验证失败 就返回
    }

    //价格 转成数字，自行打印req.body。
    const total_amount = parseInt(req.body['total_amount']);
    //订单的唯一id
    const orderId = req.body['out_trade_no'];

//-------------------------------------------------------------
    //业务逻辑
//-------------------------------------------------------------
    res.end('success');// 给支付宝返回 success    
    res.end('error');// 订单不接受，返回错误。
});

//验证签名
const RSAVerify = function (object) {
    let obj = {};
    let keys = Object.keys(object).sort();//排序
    let prestr = [];
    //去掉 sign与sign_type，装进数组
    keys.forEach(function (e) {
        if (e != 'sign' && e != 'sign_type' && (object[e] || object[e] === 0)) {
            prestr.push(`${e}=${object[e]}`);
        }
    });
    //拼接
    prestr = prestr.join('&')
    //根据排序后的订单验签名
    return crypto.createVerify('RSA-SHA1').update(prestr).verify(fs.readFileSync('./rsa_public_key.pem'), object['sign'], 'base64');//注意这个公钥是支付宝给的，并不是自己生成的。
};



module.exports = router
