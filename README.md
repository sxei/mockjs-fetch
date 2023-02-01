# mockjs-fetch

鉴于`Mock.js`不支持拦截`fetch`发起的`ajax`，本模块即为`Mock.js`的补充。安装：

```bash
npm i mockjs-fetch --save
```

有2种使用方式，可以搭配mock.js一起使用，也可以独立使用，两种方式各有区别：

* 搭配`mock.js`使用时完整继承`mock.js`的各种语法，功能更强大，但是鉴于`mock.js`在upload场景有一些至今未解决的bug，使用时有一些不太方便；
* 独立使用，只拦截fetch、不对`XMLHttpRequest`做拦截，不支持`'id|+1'`等mockjs专属语法，适合只需要对fetch做一些简单mock的场景；

> !!!请注意，线上环境务必注释mock相关代码的引入，避免对线上产生一些不必要的兼容性问题!!!

## 搭配mock.js一起使用

只需加2行代码就可以让你的`mock.js`支持`fetch`：

```js
import Mock from 'mockjs';
// 1.x 导入方式
// import mockFetch from 'mockjs-fetch';
// 2.x 导入方式
import { mockFetch } from 'mockjs-fetch';
mockFetch(Mock);
```

兼容`Mock.js`以下语法：

```js
Mock.setup({timeout: 400});
Mock.setup({timeout: '200-400'});
```

完整示例：

```js
import Mock from 'mockjs';
// 1.x 导入方式
// import mockFetch from 'mockjs-fetch';
// 2.x 导入方式
import { mockFetch } from 'mockjs-fetch';
mockFetch(Mock);

Mock.setup({
    timeout: '200-400', // mockFetch支持 mockjs 已有的 timeout 设置项
    debug: true, // mockFetch新增的设置项，如果开启，请求时会打印一些日志
});

Mock.mock(/testMockFetch\.json/, {
    code: 0,
    data: {
        total: 47,
        'data|10': [
            {
                name: '小茗同学',
                age: 18,
                address: '中国北京朝阳区'
            },
        ],
    },
});

const resp = await fetch('/aaa/testMockFetch.json').then(resp => resp.json());
console.log('输出结果：', resp);
```

## 独立使用

只对fetch进行拦截：

```js
import { Mock } from 'mockjs-fetch';

Mock.setup({
    timeout: '200-400',
    debug: true, // 如果开启，请求时会打印一些日志
});

// 直接原样输出（注意不支持 'id|+1' 等特殊语法）
Mock.mock(/testMockFetch\.json/, {
    code: 0,
    data: {
        total: 47,
        dataList: [
            {
                name: '小茗同学',
                age: 18,
                address: '中国北京朝阳区'
            },
        ],
    },
});

// 第二个参数支持写function，根据入参返回不同的结果，params会自动根据GET或POST取合适的值
Mock.mock(/testMockFetch2\.json/, ({url, params }) => {
    if (parasm.a === 1) {
        return {code: 500};
    }
    return {code: 0};
});

const resp = await fetch('/aaa/testMockFetch.json').then(resp => resp.json());
console.log('输出结果：', resp);
const resp2 = await fetch('/aaa/testMockFetch2.json').then(resp => resp.json());
console.log('输出结果：', resp2);
```
