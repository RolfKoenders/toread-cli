import { RxHR } from "@akanass/rx-http-request";
import * as fs from "fs";
import { JSDOM } from "jsdom";
import colors from "colors";
import chalk from "chalk";
import opn from "opn";

import { Article } from "./article";
import { Storage } from "./storage";
import { Display, PresentationMode } from "./display";

export class Actions {
    static storage: Storage = new Storage();

    static getArticles(): void {
        let articles: Article[] = this.storage.getArticles();
        if (!fs.existsSync("file.json")) {
            articles.forEach(a => {
                Display.printArticle(a, PresentationMode.LIST);
            });
        } else {
            console.info("%s", colors.red(`There's no article you saved.`));
        }
    }

    static openArticle(id: number): void {
        let article = this.storage.getArticle(id);
        if (article) opn(article.url);
        else Display.printOpenErrorMessage();
    }

    static saveArticle(url: string, description: string, tags?: string): void {
        RxHR.get(url).subscribe(
            (data: any) => {
                if (data.response.statusCode === 200) {
                    let window = new JSDOM(data.body).window;
                    let title = window.document.title;
                    let article: Article = {
                        title: title,
                        url: url,
                        description: description,
                        tags: tags ? tags.split(",") : []
                    };

                    Actions.storage.saveArticle(article);

                    Display.printSaveArticleMessage(data.response.statusCode);
                    Display.printArticle(article, PresentationMode.ONE);
                } else {
                    Display.printSaveArticleMessage(data.response.statusCode);
                }
            },
            (err: any) => console.error(err) // Show error in console
        );
    }

    static deleteArticle(id: number) {
        let result: boolean = this.storage.deleteArticle(id);
        if (result) {
            console.info(
                chalk`{bold.green Article with ID ${id.toString()} deleted successfully}`
            );
        } else {
            console.info(
                chalk`{bold.red An error ocurred while deleting the article, verify if it exists.}`
            );
        }
    }

    static clearArticles(): void {
        let result: boolean = this.storage.clearArticles();
        if (result) {
            console.info(chalk`{bold.green All Articles are deleted.}`);
        } else {
            console.info(
                chalk`{bold.red An error ocurred while removing all articles.}`
            );
        }
    }
}
