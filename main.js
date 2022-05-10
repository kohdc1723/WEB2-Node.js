const http = require("http");
const fs = require("fs");
const url = require("url");
const sanitizeHTML = require("sanitize-html");
const path = require("path");
const template = require("./lib/template");
const mysql = require("mysql");
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1723",
    database: "opentutorials",
    port: 3306
});
db.connect();

const app = http.createServer((request, response) => {
    let varURL = request.url;
    let queryData = url.parse(varURL, true).query;
    let pathName = url.parse(varURL, true).pathname;

    if (pathName === "/") {
        if (queryData.id === undefined) {
            db.query(`SELECT * FROM topic`, (error, result) => {
                let topics = result;
                let title = "Welcome";
                let description = "Hello, Node.js";
                let list = template.list(topics);
                let control = `
                    <a href="/create">Create</a>
                `;
                let body = `
                    <h2>${title}</h2>
                    <p>${description}</p>
                `;
                let html = template.html(title, list, control, body);

                response.writeHead(200);
                response.end(html);
            });
        } else {
            db.query(`SELECT * FROM topic`, (error1, topics) => {
                if (error1) {
                    throw error1;
                }
                db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], (error2, topic) => {
                    if (error2) {
                        throw error2;
                    }
                    let title = topic[0].title;
                    let description = topic[0].description;
                    let list = template.list(topics);
                    let control = `
                        <a href="/create">Create</a>
                        <a href="/update?id=${queryData.id}">Update</a>
                        <form action="/delete-process" method="POST">
                            <input type="hidden" name="id" value="${queryData.id}">
                            <input type="submit" value="delete">
                        </form>
                    `;
                    let body = `
                        <h2>${title}</h2>
                        <p>${description}</p>
                    `;
                    let html = template.html(title, list, control, body);
    
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if (pathName === "/create") {
        db.query(`SELECT * FROM topic`, (error, topics) => {
            let title = "Create";
            let list = template.list(topics);
            let control = `
                <a href="/create">Create</a>
            `;
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
            let html = template.html(title, list, control, body);

            response.writeHead(200);
            response.end(html);
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
            db.query(`INSERT INTO topic (title, description, created, author_id) VALUES (?, ?, NOW(), ?)`,
            [title, description, 1], (error, result) => {
                if (error) {
                    throw error;
                }
                response.writeHead(302, {
                    Location: `/?id=${result.insertId}`
                });
                response.end();
            });
        });
    } else if (pathName === "/update") {
        db.query(`SELECT * FROM topic`, (error1, topics) => {
            if (error1) {
                throw error1;
            }
            db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], (error2, topic) => {
                if (error2) {
                    throw error2;
                }
                let title = topic[0].title;
                let list = template.list(topics);
                let control = `
                    <a href="/create">Create</a> <a href="/update?id=${topic[0].id}">Update</a>
                `;
                let body = `
                    <form action="/update-process" method="POST">
                        <input type="hidden" name="id" value="${topic[0].id}">
                        <p>
                            <input type="text" name="title" value="${topic[0].title}">
                        </p>
                        <p>
                            <textarea name="description">${topic[0].description}</textarea>
                        </p>
                        <p>
                            <input type="submit" value="Submit">
                        </p>
                    </form>
                `;
                let html = template.html(title, list, control, body);

                response.writeHead(200);
                response.end(html);
            });
        });
    } else if (pathName === "/update-process") {
        let body = "";
        request.on("data", (data) => {
            body += data;
        });
        request.on("end", () => {
            let post = new URLSearchParams(body);
            let title = post.get("title");
            let description = post.get("description");
            let id = post.get("id");
            db.query(`UPDATE topic SET title=?, description=?, author_id=1 WHERE id=?`, [title, description, id], (error, result) => {
                response.writeHead(302, {
                    Location: `/?id=${id}`
                });
                response.end();
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
            db.query(`DELETE FROM topic WHERE id=?`, [id], (error, result) => {
                if (error) {
                    throw error;
                }
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