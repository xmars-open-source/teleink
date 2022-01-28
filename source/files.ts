import { open, FileHandle } from 'fs/promises';
import path from 'path';

class Files {
	static async readFile(filepath: string) {
		let filehandle: FileHandle;

		try {
			filehandle = await open(path.resolve(filepath), 'r');
			return filehandle.readFile('utf8');
		} finally {
			filehandle.close();
		}
	}

	static async writeFile(filepath: string, data: string) {
		let filehandle: FileHandle;

		try {
			filehandle = await open(path.resolve(filepath, data), 'w');
		} finally {
			filehandle.close();
		}
	}

	static async readFiles(filepaths: string[], errors?: string[]) {
		const result = [];

		filepaths.forEach(async (filepath, i) => {
			try {
				let filehandle: FileHandle;

				filehandle = await open(path.resolve(filepath), 'r');
				result.push(await filehandle.readFile('utf8'));
				filehandle.close();
			} catch (e) {
				if (errors[i]) {
					console.log(errors[i]);
				} else {
					console.error(e);
				}
			}
		});

		return result;
	}
}

export default Files;
