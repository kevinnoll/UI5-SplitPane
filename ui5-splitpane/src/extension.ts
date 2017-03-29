'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "ui5-splitpane" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });

    this.filesToIgnore = [];
    vscode.workspace.onDidOpenTextDocument((e: vscode.TextDocument) => {
        if (this.isController(e)) {
            let controllerName = this.getFileName(e.fileName),
                controllerNameWithoutSuffix = controllerName.slice(0, controllerName.length - 14),
                viewName = controllerNameWithoutSuffix + ".view.xml",
                searchString = "**/" + viewName;

            // ignore sibling file.
            if (this.filesToIgnore.indexOf(controllerNameWithoutSuffix) !== -1) {
                this.filesToIgnore.splice(this.filesToIgnore.indexOf(controllerNameWithoutSuffix), 1);
                return;
            }

            vscode.workspace.findFiles(searchString).then((file) => {
                if (file[0]) {
                    vscode.workspace.openTextDocument(file[0]).then((textDocument: vscode.TextDocument) => {
                        vscode.window.showTextDocument(textDocument, vscode.ViewColumn.Two, true);
                        this.filesToIgnore.push(viewName);
                    });
                }
            })
        }

        if (this.isView(e)) {
            let viewName = this.getFileName(e.fileName),
                viewNameWithoutSuffix = viewName.slice(0, viewName.length - 14),
                controllerName = viewNameWithoutSuffix + ".controller.js",
                searchString = "**/" + controllerName;

            // ignore sibling file.
            if (this.filesToIgnore.indexOf(viewNameWithoutSuffix) !== -1) {
                this.filesToIgnore.splice(this.filesToIgnore.indexOf(viewNameWithoutSuffix), 1);
                return;
            }

            vscode.workspace.findFiles(searchString).then((controllers) => {
                if (controllers[0]) {
                    vscode.workspace.openTextDocument(controllers[0]).then((textDocument: vscode.TextDocument) => {
                        vscode.window.showTextDocument(textDocument, vscode.ViewColumn.One, false);
                        this.filesToIgnore.push(controllerName);

                        vscode.workspace.findFiles(viewName).then((controllers) => {
                            if (controllers[0]) {
                                vscode.window.showTextDocument(textDocument, vscode.ViewColumn.Two, true);
                                this.filesToIgnore.push(viewName);
                            }
                        });
                    });
                }
            })
        }

    });

    this.isController = function (textDocument: vscode.TextDocument) {
        if (textDocument.languageId === "javascript") {
            let controllerName = this.getFileName(textDocument.fileName);
            if (controllerName.endsWith(".controller.js")) {
                return true;
            }
        }
        return false;
    }

    this.isView = function (textDocument: vscode.TextDocument) {
        if (textDocument.languageId === "xml") {
            let controllerName = this.getFileName(textDocument.fileName);
            if (controllerName.endsWith(".view.xml")) {
                return true;
            }
        }
        return false;
    }

    this.getFileName = function (path: String) {
        let aPieces = path.split("/");
        return aPieces[aPieces.length - 1];
    }

    context.subscriptions.push(disposable);
}


// this method is called when your extension is deactivated
export function deactivate() {
}