const template = {
    html: (title, list, control, body) => {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>WEB - ${title}</title>
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
    },
    list: (filelist) => {
        let list = "<ul>";
        let i = 0;
        while (i < filelist.length) {
            list = list + `<li><a href="/?title=${filelist[i]}">${filelist[i]}</a></li>`;
            i++;
        }
        list = list + "</ul>";
        return list;
    }
};

module.exports = template;