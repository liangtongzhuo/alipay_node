在看代码之前我们需要了解一下， 服务器之间的交互流程。


<img src="000.jpg" >

Node 服务器只用关心 1  ／ 2 ／ 7 ／8  流程。
iOS 端只用关心 1 ／ 2  ／ 3 ／ 6  流程。

### 我们为了安全，要注意流程 7 和 8。  到流程 7 用户的支付环节已经结束了并且支付成功了， 下来验签支付宝服务器发送过来的请求，验签通过后并且业务处理结束后，返回 ‘success’，这次购买算结束了。

这两个中间件

```
app.use('/encrypt', encrypt);//生成订单
app.use(verify);//接受支付宝异步回调，验证，业务处理。
```
encrypt 生成订单的伪代码，具体代码可以去 github

```
/*
1.解析url
2.根据用户ID，创建订单
3.组成字符串 加密
4.返回加密
*/
router.get(function (req, res) {
    creatOrder(req.query['userId'], req.query['price'], res);
});
//根据唯一ID创建，价格，时间，生成订单对象
const creatOrderInfo = function (price, orderId, currenTime, res) {
    const biz_content = {
        total_amount: price + "", //价格
        subject: "vip ", //介绍
    }
    const jsonBiz_content = JSON.stringify(biz_content) //JSON
    const orderInfo = {
        biz_content: jsonBiz_content, //订单基础信息
        notify_url: 'http://www.ziji.com/verify',  //自己设置异步回调接口
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
```

支付宝向我们发送 verify 验证签名。 也就是流程 7 和 8

```
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
    //业务逻辑，这里都是安全的，通过了验证签名。
//-------------------------------------------------------------
    res.end('success');// 成功给支付宝返回 success    
    res.end('error');// 失败，返回错误。 
});
```

我在 github 看没有良好的支付宝 Node 插件， 如果有需要可以整理成插件，发布到NPM。<br>
如果封装成插件，可能就需要10行代码了。<br>

我的博客：www.liangtongzhuo.com

