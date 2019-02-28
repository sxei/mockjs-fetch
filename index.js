/**
 * 鉴于Mock.js不支持拦截fetch发起的ajax，本文件即为Mock.js的补充。
 * 兼容Mock.js以下语法：
 * Mock.setup({timeout: 400})
 * Mock.setup({timeout: '200-400'})
 */
function mockFetch(Mock) {
    if (!Mock || !Mock.mock) {
        throw new Error('Mock.js is required.');
    }
    const tempFetchName = '__mockFetchRawFetch__';
    // 防止重复引入
    if (window[tempFetchName]) {
        return;
    }
    window[tempFetchName] = window.fetch;
    window.fetch = function(url, options) {
        const method = (options || { method: 'GET' }).method;
        if (Mock.XHR._settings.debug) {
            console.log(`${method} ${url}`);
        }
        for (const key in Mock._mocked) {
            const item = Mock._mocked[key];
            const urlMatch = (typeof item.rurl === 'string' && url.indexOf(item.rurl) >= 0) ||
                (item.rurl instanceof RegExp && item.rurl.test(url));
            const methodMatch = !item.rtype || (item.rtype === method);
            if (urlMatch && methodMatch) {
                let timeout = Mock.XHR._settings.timeout || '200-400';
                if (typeof timeout === 'string') {
                    const temp = timeout.split('-').map(item => parseInt(item));
                    timeout = temp[0] + Math.round(Math.random() * (temp[1] - temp[0]));
                }
                return new Promise(resolve => {
                    const resp = typeof item.template === 'function' ? item.template.apply() : Mock.mock(item.template);
                    setTimeout(() => {
                        resolve({
                            text() {
                                return Promise.resolve(JSON.stringify(resp));
                            },
                            json() {
                                return Promise.resolve(resp);
                            },
                            blob() {
                                return Promise.resolve(resp);
                            },
                            formData() {
                                return Promise.resolve(resp);
                            },
                            arrayBuffer() {
                                return Promise.resolve(resp);
                            },
                        });
                        if (Mock.XHR._settings.debug) {
                            console.log(resp);
                        }
                    }, timeout);
                });
            }
        }
        return window[tempFetchName](url, options);
    };
}


module.exports = mockFetch;
