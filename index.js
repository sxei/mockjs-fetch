function getParams(url) {
    var params = {};
    (url.split('?')[1] || '').split('&').map(item => item.split('=')).forEach(([key, value]) => {
        params[key] = value;
    });
    return params;
}
/**
 * 鉴于Mock.js不支持拦截fetch发起的ajax，本模块即为Mock.js的补充。
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
    window.fetch = function(url, options = {}) {
        options = options || {method: 'GET'};
        const method = options.method;
        if (Mock.XHR._settings.debug) {
            console.log(`${method} ${url}`, 'options: ', options);
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
                options.url = url;
                return new Promise(resolve => {
                    let params = {};
                    if (method === 'GET') {
                        (url.split('?')[1] || '').split('&').map(item => item.split('=')).forEach(([key, value]) => {
                            params[key] = value;
                        });
                    } else if (method === 'POST') {
                        // 仅考虑最见场景，有待完善
                        try {
                            if (options.headers && (options.headers['Content-Type'] || '').indexOf('json') > 0) {
                                params = JSON.parse(options.body || '{}');
                            } else {
                                params = getParams(`?${options.body || ''}`);
                            }
                        } catch (e) {
                        }
                    }
                    // function的参数包括fetch的原始options以及url和解析出来的params
                    const resp = typeof item.template === 'function' ? item.template.call(this, { url, params, ...options }) : Mock.mock(item.template);
                    setTimeout(() => {
                        resolve({
                            ok: true,
                            status: 200,
                            headers: {
                                get() {
                                    return '';
                                },
                                set() {

                                },
                            },
                            text() {
                                return Promise.resolve(JSON.stringify(resp));
                            },
                            json() {
                                return Promise.resolve(resp);
                            },
                            // blob、formData等一系列方法仅仅是为了让fetch不报错，并没有具体实现它
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
                            console.log('resp: ', resp);
                        }
                    }, timeout);
                });
            }
        }
        return window[tempFetchName](url, options);
    };
}

var Mock = {
    _mocked: {},
    XHR: {
        _settings: {},
    },
    idx: 0,
    mock: function(rurl, template) {
        // 兼容 Mock.mock(template) 的语法
        if (!template) {
            return rurl;
        }
        mockFetch(Mock);
        Mock._mocked[`${Mock.idx++}`] = { rurl, template };
    },
    setup: function(settings) {
        Object.assign(Mock.XHR._settings, settings || {});
    },
};

module.exports = {
    mockFetch,
    Mock,
};
