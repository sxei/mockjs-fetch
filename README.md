# mockjs-fetch

鉴于Mock.js不支持拦截fetch发起的ajax，本模块即为Mock.js的补充。兼容Mock.js以下语法：

 * Mock.setup({timeout: 400})
 * Mock.setup({timeout: '200-400'})

加2行代码让你的`mock.js`支持`fetch`：

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

