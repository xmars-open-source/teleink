import React, { FC, useMemo, useRef, useState } from 'react';
import { Telegraf } from 'telegraf';
import { v4 as key } from 'uuid';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import Encryption from './encryption';

const App: FC<{ encryption: Encryption; token?: string }> = ({
	encryption,
	token,
}) => {
	const [history, setHistory] = useState<string[]>([]);
	const [chatId, setChatId] = useState<string>();
	const [input, setInput] = useState('');

	// Hack for state because of callbacks
	const stateRef = useRef(history);
	stateRef.current = history;

	const bot = useMemo(() => {
		const bot = new Telegraf(token);

		bot.on('channel_post', (ctx) => {
			if (!chatId) {
				setChatId(ctx.chat.id.toString());
			}

			const text = (ctx.update.channel_post as any).text;

			try {
				// I'm not sure why the channel_post doesn't have `text` in d.ts
				addHistory(encryption.decrypt(text));
			} catch (e) {
				console.log('Err. Received message from channel: ', text);
			}
		});

		process.once('SIGINT', () => bot.stop('SIGINT'));
		process.once('SIGTERM', () => bot.stop('SIGTERM'));

		bot.launch().catch(console.error);

		return bot;
	}, []);

	const renderHistory = useMemo(
		() => history.map((msg, i) => <Text key={key()}>{`> ${msg}`}</Text>),
		[history]
	);

	function clearInput() {
		setInput('');
	}

	function addHistory(input: string) {
		setHistory([...stateRef.current, input]);
	}

	function onSubmit(input: string) {
		addHistory(input);
		bot.telegram.sendMessage(chatId, encryption.encrypt(input));
		clearInput();
	}

	return (
		<Box flexDirection="column">
			{!chatId ? (
				<Box>
					<Text color="red">
						Waiting for a chat id. Send message in channel via Telegram or wait
						for a message from friend.
					</Text>
				</Box>
			) : (
				<>
					<Box flexDirection="column" borderStyle="single">
						{renderHistory}
					</Box>
					<Box flexDirection="column" borderStyle="double" marginTop={1}>
						<TextInput value={input} onChange={setInput} onSubmit={onSubmit} />
					</Box>
				</>
			)}
		</Box>
	);
};

export default App;
