// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { posix } from 'path';
import ignore from 'ignore';
import path = require('path');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('codinggame.compactC#', async () => {

		async function getAllFilePaths(folder: vscode.Uri): Promise<string[]> {
			var paths: string[] = [];

			for (const [name, type] of await vscode.workspace.fs.readDirectory(folder)) {
				if (type === vscode.FileType.File) {
					const filePath = posix.join(folder.path, name);
					paths.push(filePath);
				} else if (type === vscode.FileType.Directory) {
					const folderUri =  vscode.Uri.parse(posix.join(folder.path, name));
					paths = paths.concat(await getAllFilePaths(folderUri));
				}
			}
			return paths;
		}

		const workspaceFolderUris = vscode.workspace.workspaceFolders?.map(folder => folder.uri);

		if(workspaceFolderUris) {
			var allFilePaths: string[] = [];
			var folderToHandle!: vscode.Uri;

			if(workspaceFolderUris.length > 1)
			{
				const options = <vscode.QuickPickOptions>{
					matchOnDescription: false,
					matchOnDetail: false,
					placeHolder: 'Choose a workspace folder...',
				};

				const folderItems = workspaceFolderUris.map(folder => <vscode.QuickPickItem>{
					label: folder.path,
					description: folder.fsPath,
					
				  });
				
				var picked = await vscode.window.showQuickPick(folderItems, options);

				if(picked)
				{
					folderToHandle = vscode.Uri.parse(picked.label);
				}

			} else {
				folderToHandle = workspaceFolderUris[0];
			}

			allFilePaths = allFilePaths.concat((await getAllFilePaths(folderToHandle)).map(p => path.relative('/', p)));

			const exclusionGlobs = ignore().add(['obj', 'bin', '**/*.test']);
			allFilePaths = exclusionGlobs.filter(allFilePaths);
			allFilePaths = allFilePaths.filter(file => file.endsWith(".cs"));

			var allCodeLines: string[] = [];

			for(const fileUri of allFilePaths) {
				const readData = await vscode.workspace.fs.readFile(vscode.Uri.parse(fileUri));
				const readStr = Buffer.from(readData).toString('utf8');

				allCodeLines = allCodeLines.concat(readStr.replace(/\r\n/g,'\n').split('\n'));
			}

			//testing commits
			const resultString = allCodeLines.join('\r\n');
			const doc = await vscode.workspace.openTextDocument({ content: resultString });
			vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });
		}
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}
