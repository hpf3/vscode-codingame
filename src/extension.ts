// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { posix } from 'path';
import { URI } from 'vscode-uri';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('codinggame.compactC#', async () => {

		async function getAllFilePaths(folder: vscode.Uri): Promise<string[]> {
			var paths: string[] = [];

			for (const [name, type] of await vscode.workspace.fs.readDirectory(folder)) {
				if (type === vscode.FileType.File) {
					const filePath = posix.join(folder.path, name);
					console.log(filePath);
					paths.push(filePath);
				} else if (type === vscode.FileType.Directory) {
					const folderUri =  URI.parse(posix.join(folder.path, name));
					paths.concat(await getAllFilePaths(folderUri));
				}
			}
			return paths;
		}

		const workspaceFolderUris = vscode.workspace.workspaceFolders?.map(folder => folder.uri);

		if(workspaceFolderUris) {
			var allFilePaths: string[] = [];

			for (const folderUri of workspaceFolderUris) {
				allFilePaths.concat(await getAllFilePaths(folderUri));
			}

			const resultString = allFilePaths.join('\r\n');
			const doc = await vscode.workspace.openTextDocument({ content: resultString });
			vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });
		}
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}
