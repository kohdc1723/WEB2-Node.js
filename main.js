const http = require('http');
const fs = require('fs');
const url = require('url');

const app = http.createServer((request, response) => {
    let varURL = request.url;
    let queryData = url.parse(varURL, true).query;
    let pathName = url.parse(varURL, true).pathname;
        
    if (pathName === "/") {
        if (queryData.id === undefined) {
            let title = "Welcome";
            let description = "Hello, Node.js";
            let template = `
                <!doctype html>
                <html>
                    <head>
                        <title>WEB1 - ${title}</title>
                        <meta charset="utf-8">
                    </head>
                    <body>
                        <h1><a href="/">WEB</a></h1>
                        <ol>
                            <li><a href="/?id=HTML">HTML</a></li>
                            <li><a href="/?id=CSS">CSS</a></li>
                            <li><a href="/?id=JavaScript">JavaScript</a></li>
                        </ol>
                        <h2>${title}</h2>
                        <p>${description}</p>
                    </body>
                </html>
            `;
            response.writeHead(200);
            response.end(template);
        } else {
            fs.readFile(`./data/${queryData.id}`, 'utf8', (error, data) => {
                let title = queryData.id;
                let description = data;
                let template = `
                    <!doctype html>
                    <html>
                        <head>
                            <title>WEB1 - ${title}</title>
                            <meta charset="utf-8">
                        </head>
                        <body>
                            <h1><a href="/">WEB</a></h1>
                            <ol>
                                <li><a href="/?id=HTML">HTML</a></li>
                                <li><a href="/?id=CSS">CSS</a></li>
                                <li><a href="/?id=JavaScript">JavaScript</a></li>
                            </ol>
                            <h2>${title}</h2>
                            <p>${description}</p>
                        </body>
                    </html>
                `;
                response.writeHead(200);
                response.end(template);
            });
        }
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});

app.listen(3000);