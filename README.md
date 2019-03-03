# mockjs-fetch

鉴于`Mock.js`不支持拦截`fetch`发起的`ajax`，本模块即为`Mock.js`的补充。安装：

```bash
npm i mockjs-fetch --save
```

只需加2行代码就可以让你的`mock.js`支持`fetch`：

```js
import Mock from 'mockjs';
import mockFetch from 'mockjs-fetch';
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
import mockFetch from 'mockjs-fetch';
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
```

页面测试：

```js
fetch('/aaa/testMockFetch.json').then(resp => resp.json()).then(resp => {
	console.log('输出结果：', resp);
})
```

