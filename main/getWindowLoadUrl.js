const {format} = require('url');

const devPath = 'http://localhost:3000';

const prodPath = format({
    pathname: 'build/index.html',
    protocol: 'file:',
    slashes: true
});

module.exports = process.env.NODE_ENV === 'development' ? devPath : prodPath;



