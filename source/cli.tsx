#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import prompts from 'prompts';
import meow from 'meow';
import App from './ui';
import Encryption from './encryption';
import Files from './files';

const cli = meow(
	`
	Usage
	  $ teleink

	Options
		--token [token]

	Examples
	  $ teleink --token=[token]
`,
	{
		flags: {
			token: {
				type: 'string',
			},
		},
	}
);

(async () => {
	let token = cli.flags.token;
	let friendPublicKey;
	let privateKey;
	let publicKey;

	[friendPublicKey, privateKey, publicKey] = await Files.readFiles(
		['friendPublicKey.pem', 'privateKey.pem', 'publicKey.pem'],
		[
			'Cannot find friend`s public key',
			'Cannot read private key. You can generate a new one.',
			`Cannot read public key. That's fine if your friend has it`,
		]
	);

	if (!token) {
		token = (
			await prompts({
				type: 'text',
				name: 'token',
				message: 'Enter token of your bot',
			})
		).token;
	}

	const { passphrase } = await prompts({
		type: 'text',
		name: 'passphrase',
		message: 'Enter passphrase to generate new key / decode messages',
	});

	if (!privateKey || !publicKey) {
		const { newKey } = await prompts({
			type: 'confirm',
			name: 'newKey',
			message: 'Do you want to generate a new pair of keys?',
			initial: true,
		});

		if (newKey) {
			({ privateKey, publicKey } = await Encryption.generateKeys(passphrase));

			await Files.writeFile('publicKey.pem', publicKey);
			await Files.writeFile('privateKey.pem', privateKey);
		}
	}

	if (passphrase && friendPublicKey && privateKey) {
		const encryption = new Encryption(passphrase, friendPublicKey, privateKey);

		render(<App encryption={encryption} token={token} />);
	}
})();
