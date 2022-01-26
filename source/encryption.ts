import crypto, { generateKeyPairSync } from 'crypto';
import Files from './files';

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

		await Files.writeFile('publicKey.pem', publicKey);
		await Files.writeFile('privateKey.pem', privateKey);
	}

	constructor(passphrase: string, friendPublicKey: string, privateKey: string) {
		this.passphrase = passphrase;
		this.friendPublicKey = friendPublicKey;
		this.privateKey = privateKey;
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
