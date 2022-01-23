#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import prompts from 'prompts';
import meow from 'meow';
import App from './ui';
import Encryption from './encryption';

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

const questions = [
	{
		type: 'string',
		name: 'friendPublic',
		message: 'Friends',
	},
	{
		type: 'text',
		name: 'about',
		message: 'Tell something about yourself',
		initial: 'Why should I?',
	},
];

(async () => {
	let friendPublicKey;
	let privateKey;
	let publicKey;

	try {
		friendPublicKey = await Encryption.readFile('friendPublicKey.pem');
	} catch (e) {
		console.error(e);
		console.error('Cannot find friend`s public key');
	}

	let { token } = await prompts({
		type: 'text',
		name: 'token',
		message: 'Enter token of your bot',
		initial: cli.flags.token,
	});

	const { passphrase } = await prompts({
		type: 'text',
		name: 'passphrase',
		message: 'Enter passphrase to generate new key / decode messages',
	});

	const { newKey } = await prompts({
		type: 'confirm',
		name: 'newKey',
		message: 'Do you want to generate a new pair of keys?',
		initial: false,
	});

	if (newKey) {
		Encryption.generateKeys(passphrase);
	}

	try {
		privateKey = await Encryption.readFile('privateKey.pem');
	} catch (e) {
		console.error(e);
		console.log(`Cannot read private key. You can generate a new one.`);
	}

	try {
		publicKey = await Encryption.readFile('publicKey.pem');

		console.log(`Your public key: `);
		console.log(publicKey);
	} catch (e) {
		console.log(`Cannot read public key. That's fine if your friend has it`);
	}

	if (passphrase && friendPublicKey && privateKey) {
		const encryption = new Encryption(passphrase, friendPublicKey, privateKey);

		render(<App encryption={encryption} token={token} />);
	}
})();
