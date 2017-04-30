'use strict';
const router = require('express').Router();
const fs = require('fs');
const crypto = require('crypto');


// 加密
/*
1.解析url
2.根据用户ID，创建订单
3.组成字符串 加密
4.返回加密
*/
router.get(function (req, res) {
    creatOrder(req.query['userId'], req.query['price'], res);
});
//根据用户id 创建订单id
const creatOrder = function (userId, price, res) {
    //由于是iOS 或者 android 的请求，携带当前用户的唯一id和买东西的价格。
    
    //-------------------------------------------------------------
    //业务逻辑
    //这里数据库业务， 产生订单的唯一id和订单的时间
    //-------------------------------------------------------------
    
    //生成订单
    creatOrderInfo(price, orderId, currenTime, res);
}

//根据唯一ID创建，价格，时间，生成订单对象
const creatOrderInfo = function (price, orderId, currenTime, res) {
    const biz_content = {
        timeout_express: "30m",//超时时间
        seller_id: "20884228000000000",// 卖家支付宝用户号
        product_code: "QUICK_MSECURITY_PAY",
        total_amount: price + "", //价格
        subject: "vip", //介绍
        body: "vip", //详情介绍
        out_trade_no: orderId //订单的唯一id, 
    }

    const jsonBiz_content = JSON.stringify(biz_content) //JSON

    const orderInfo = {
        app_id: '2016100800000000',//支付宝分配给开发者的应用Id
        biz_content: jsonBiz_content, //订单基础信息
        charset: 'utf-8',
        method: 'alipay.trade.app.pay',//支付接口名称
        notify_url: 'http://www.ziji.com/verify',  //自己设置异步回调接口
        sign_type: 'RSA',
        timestamp: moment(currenTime).format('YYYY-MM-DD HH:mm:ss'), //时间
        version: '1.0'
    }

    //拼接未加密的订单，由于我上面的订单就是根据key排序写的，所以不需要根据key排序了。
    const info = generateOrder(orderInfo, false);

    //RSA加密订单
    const sign = crypto.createSign('RSA-SHA1');
    const private_key = fs.readFileSync('./rsa_private_key_pkcs8.pem');//注意生成的密钥，是带数字8的。
    sign.update(info);//设置验证签名参数
    const signOrder = encodeURIComponent(sign.sign(private_key)); //RSA加密后  在encoded

    //----------------------------------------------------------------------
    //拼接订单encode
    const encodeOrder = generateOrder(orderInfo, true);
    const infoReturn = {
        order: encodeOrder + '&sign=' + signOrder
    }
    //返回JSON数据
    res.json(JSON.stringify(infoReturn));
}


//字符串拼接生成订单,是否encode转义
var generateOrder = function (orderInfo, encode) {
    let info = ''
    for (let key in orderInfo) {
        let orderInfoValue = orderInfo[key]

        if (encode) { //把value 转义encodeURI
             orderInfoValue = encodeURIComponent(orderInfoValue);
        }
        //拼接参数
        info += key + '=' + orderInfoValue + '&'
    }

    //删除最后一个&
    return info.substring(0, info.length - 1)
}


module.exports = router
