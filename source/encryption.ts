import { open, FileHandle } from 'fs/promises';
import path from 'path';
import crypto, { generateKeyPairSync } from 'crypto';

class Encryption {
	private passphrase: string;
	private privateKey: string;
	private friendPublicKey: string;

	static async generateKeys(passphrase: string) {
		const { publicKey, privateKey } = generateKeyPairSync('rsa', {
			modulusLength: 4096,
			publicKeyEncoding: {
				type: 'spki',
				format: 'pem',
			},
			privateKeyEncoding: {
				type: 'pkcs8',
				format: 'pem',
				cipher: 'aes-256-cbc',
				passphrase: passphrase,
			},
		});

		await Encryption.writeFile('publicKey.pem', publicKey);
		await Encryption.writeFile('privateKey.pem', privateKey);
	}

	static async readFile(filepath: string) {
		let filehandle: FileHandle;

		try {
			filehandle = await open(path.resolve(filepath), 'r+');
			return filehandle.readFile('utf8');
		} finally {
			filehandle.close();
		}
	}

	static async writeFile(filepath: string, data: string) {
		let filehandle: FileHandle;

		try {
			filehandle = await open(path.resolve(filepath), 'w+');
		} finally {
			filehandle.close();
		}
	}

	constructor(passphrase: string, friendPublicKey: string, privateKey: string) {
		this.passphrase = passphrase;
		this.friendPublicKey = friendPublicKey;
		this.privateKey = privateKey;
	}

	setFriendPublicKey(friendPublicKey: string) {
		this.friendPublicKey = friendPublicKey;
	}

	encrypt(toEncrypt: string) {
		return crypto
			.publicEncrypt(this.friendPublicKey, Buffer.from(toEncrypt))
			.toString('base64');
	}

	decrypt(toDecrypt: string) {
		const decrypted = crypto.privateDecrypt(
			{
				key: this.privateKey,
				passphrase: this.passphrase,
			},
			Buffer.from(toDecrypt, 'base64')
		);

		return decrypted.toString('utf8');
	}
}

export default Encryption;
