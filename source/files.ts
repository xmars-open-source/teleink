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
}

export default Files;
