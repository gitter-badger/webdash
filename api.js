const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const bowerJson = require('./bower.json');

const plugins = getPlugins(bowerJson);

for (const plugin of plugins) {
    const pluginSrc = require(`./bower_components/${plugin}/api.js`);
    if (!pluginSrc.routes) {
        continue;
    }
    const routes = pluginSrc.routes;
    if (routes.get) {
        for (const [route, handler] of Object.entries(routes.get)) {
            app.get(`/api/${plugin}/${route}`, handler);
        }
    }
    if (routes.post) {
        for (const [route, handler] of Object.entries(routes.post)) {
            app.post(`/api/${plugin}/${route}`, handler);
        }
    }
}

app.get('/api/webdash/info', (req, res) => {
    const packageJson = require('./package.json');
    const appName = packageJson.name;

    res.send({ appName });
});


app.get('/api/webdash/plugins', (req, res) => {
    const plugins = getPlugins(bowerJson);

    res.send({ plugins });
});


app.use(express.static(__dirname + '/build/es6-bundled'));

app.get('*', function (req, res) {
    res.sendFile("index.html", { root: '.' });
});

app.listen(3000, () => {
    console.log('Webdash server running');
});


function getPlugins(bowerJson) {
    if (!bowerJson) {
        return [];
    }
    const deps = Object.keys(bowerJson.devDependencies);
    if (!deps) {
        return [];
    }

    return deps.filter(dep => dep.startsWith('webdash-'));
}