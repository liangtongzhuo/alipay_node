'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const encrypt = require('./routes/encrypt.js');
const verify = require('./routes/verify.js');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use('/encrypt', encrypt);//生成订单
app.use(verify);//接受支付宝异步回调，验证，业务处理。


app.listen(3000, function () {
    console.log('启动服务器：3000');
});


module.exports = app;
