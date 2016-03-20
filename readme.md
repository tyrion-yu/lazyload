## 导读

新的api灵感一部分来自马叔的whereami，一部分来自淘宝FED - 小胡子哥（新浪微博[@Barret李靖 ](http://weibo.com/173248656?is_all=1)）的lazyload。

鉴于点评的活动页和产品页基本都是带jquery和zepto的，所以可以直接用上他们的能力，使得实现更简洁。


## Live Demo

pc端：[点评家装案例列表页](http://www.dianping.com/shop/21369201/wedding/product)（目前用的仍是旧的lazyload，近期更新）
移动端：点评家装案例列表页（comming soon）

## Usage

直接将这个js文件拷贝到你的项目中，借鉴了小胡子哥lazyload里的UMD部分。

**cortex或者webpack：**

``` javascript
var LazyLoad = require('./yourFilePath/lazyload.js');
```

**neuron：**

``` javascript
DP.define(['yourPkg::common/lazyload'],function(D, require){
    var LazyLoad = require('yourPkg::common/lazyload');
});
```

**独立版本：**

``` html
<script src="http://yourFilePath/lazyload.js"></script>

<script>
    // api就在window.LazyLoad上啦！
</script>
```

    正如你所见，笔者并未将代码上传到什么地方…… 目前只是在家装频道自己的包里自个儿用用。

---

通过上述方法将代码引入到你的业务代码中之后，就可以开始使用啦！
``` html
<ul class="box">
    <li><img src data-src="img-path"></li>
</ul>
```

``` javascript
LazyLoad.config({
    dollar: $,
    tag: "data-src",
    offset: 0,
    duration: 200,
    loading: function(percent){
        console.log('加载进度',percent,'%');
    },
    complete: function(){
        console.log("All item loaded");
    }
});
```

`LazyLoad.config` 可以被反复调用，每次传入需要更新的参数即可。

---

## 参数解读

`{Object} dollar`
组件依赖jQuery或zepto，可以通过此参数传入。如果window.$正是jQuery或zepto，可以省略此参数。

`{String} tag`
默认值是 'data-src', 我们不定义图片的src, 会通过'data-src'读取图片;

`{Number} offset`
默认是 0, 如果你希望图片在未进入可视区之前进行加载，可以定义这个偏移量。传入一个正整数，会使进入到**当前可视区底部以下一定范围**内的图片开始加载，以 px 作为单位衡量。如果传入一个负数，就不进行当前可视区判断，直接加载所有的图片。

`{Number} duration`
默认值因环境而异，代表图片渐隐进入画面的过渡时间，单位以毫秒衡量。pc端的默认值是600，移动端的默认值是200。如果传0，会在**图片加载完成**后，瞬间显示。如果传入一个负数，会在**图片未加载完成**时，开始显示。

`{Function || null} loading`
可选的回调函数，在图片加载时，会反馈一个进度，0-100的整数。
传递没有语句的函数或者null可以取消之前设定的回调。

    制作图片多的活动页时，如果有加载态，这个方法就太好用了…… 可以将容器隐藏于页面上，待加载的图片列于其中。

`{Function || null} complete`
可选的回调函数，在所有的图片加载完成后，开始执行。
传递没有语句的函数或者null可以取消之前设定的回调。

    跟 loading 配合 风味更佳噢 -。-

---

## API

``` javascript
LazyLoad.load('.box');
LazyLoad.load($('.box')); // both ok

LazyLoad.stop();
```

### #load([selector])

`{String || jQuery/zepto元素集} [selector]`

设置懒加载的图片容器，并立即进行一次可视区的图片加载，之后根据可视区的变化加载图片。容器中不带 `data-src` 的图片会被剔除在外。

    该方法可以被连续地多次使用，每次被调用都会清空上回的图片列队。

如果不传参数，则代表整个文档的所有图片。

### #stop()

清空图片列队，停止加载。

## Liscese

Under MIT Liscese. Copyright (c) 2016 俞天麟(Tyrion Yu)