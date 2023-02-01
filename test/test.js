const { Mock } = require('../index');
Mock.setup({
    debug: true,
    timeout: '200-800',
});
Mock.mock('test-mock1.json', {
    code: 0,
    message: 'success',
});