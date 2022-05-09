const http = require("http");
const fs = require("fs");
const url = require("url");

function templateHTML(title, list, control, body) {
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <title>WEB1 - ${title}</title>
                <meta charset="utf-8">
            </head>
            <body>
                <h1><a href="/">WEB</a></h1>
                ${list}
                ${control}
                ${body}
            </body>
        </html>
    `;
}

function templateList(filelist) {
    let list = "<ul>";
    let i = 0;
    while (i < filelist.length) {
        list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
        i++;
    }
    list = list + "</ul>";
    return list;
}

const app = http.createServer((request, response) => {
    let varURL = request.url;
    let queryData = url.parse(varURL, true).query;
    let pathName = url.parse(varURL, true).pathname;

    if (pathName === "/") {
        if (queryData.id === undefined) {
            fs.readdir("./data", (error, filelist) => {
                let title = "Welcome";
                let description = "Hello, Node.js";

                let list = templateList(filelist);
                let control = `
                    <a href="/create">Create</a>
                `;
                let body = `
                    <h2>${title}</h2>
                    <p>${description}</p>
                `;
                let template = templateHTML(title, list, control, body);

                response.writeHead(200);
                response.end(template);
            });
        } else {
            fs.readdir("./data", (error, filelist) => {
                fs.readFile(`./data/${queryData.id}`, 'utf8', (error, data) => {
                    let title = queryData.id;
                    let description = data;
                    let list = templateList(filelist);
                    let control = `
                        <a href="/create">Create</a>
                        <a href="/update?id=${title}">Update</a>
                        <form action="/delete-process" method="POST">
                            <input type="hidden" name="id" value="${title}">
                            <input type="submit" value="delete">
                        </form>
                    `;
                    let body = `
                        <h2>${title}</h2>
                        <p>${description}</p>
                    `;

                    let template = templateHTML(title, list, control, body);

                    response.writeHead(200);
                    response.end(template);
                });
            });
        }
    } else if (pathName === "/create") {
        fs.readdir("./data", (error, filelist) => {
            let title = "Web - Create";
            let list = templateList(filelist);
            let control = ``;
            let body = `
                <form action="/create-process" method="POST">
                    <p>
                        <input type="text" name="title" placeholder="title">
                    </p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        <input type="submit" value="Submit">
                    </p>
                </form>
            `;
            let template = templateHTML(title, list, control, body);

            response.writeHead(200);
            response.end(template);
        });
    } else if (pathName === "/create-process") {
        let body = "";
        request.on("data", (data) => {
            body += data;
        });
        request.on("end", () => {
            let post = new URLSearchParams(body);
            let title = post.get("title");
            let description = post.get("description");
            fs.writeFile(`data/${title}`, description, "utf8", (error) => {
                response.writeHead(302, {
                    Location: `./?id=${title}`
                });
                response.end();
            });
        });
    } else if (pathName === "/update") {
        fs.readdir("./data", (error, filelist) => {
            fs.readFile(`./data/${queryData.id}`, 'utf8', (error, data) => {
                let title = queryData.id;
                let description = data;
                let list = templateList(filelist);
                let control = `
                    <a href="/create">Create</a> <a href="/update?id=${title}">Update</a>
                `;
                let body = `
                    <form action="/update-process" method="POST">
                        <input type="hidden" name="title" value="${title}">
                        <p>
                            <input type="text" name="new-title" placeholder="title" value="${title}">
                        </p>
                        <p>
                            <textarea name="description" placeholder="description">${description}</textarea>
                        </p>
                        <p>
                            <input type="submit" value="Submit">
                        </p>
                    </form>
                `;

                let template = templateHTML(title, list, control, body);

                response.writeHead(200);
                response.end(template);
            });
        });
    } else if (pathName === "/update-process") {
        let body = "";
        request.on("data", (data) => {
            body += data;
        });
        request.on("end", () => {
            let post = new URLSearchParams(body);
            let newTitle = post.get("new-title");
            let title = post.get("title");
            let description = post.get("description");
            fs.rename(`./data/${title}`, `./data/${newTitle}`, (error) => {
                fs.writeFile(`data/${newTitle}`, description, "utf8", (error) => {
                    response.writeHead(302, {
                        Location: `/?id=${newTitle}`
                    });
                    response.end();
                });
            });
        });
    } else if (pathName === "/delete-process") {
        let body = "";
        request.on("data", (data) => {
            body += data;
        });
        request.on("end", () => {
            let post = new URLSearchParams(body);
            let id = post.get("id");
            fs.unlink(`./data/${id}`, (error) => {
                response.writeHead(302, {
                    Location: `/`
                });
                response.end();
            });
        });
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});

app.listen(3000);