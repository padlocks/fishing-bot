'use client';

import React from 'react';
import { signIn } from "next-auth/react";

export default function SignInWithDiscord() {
	return (
		<button
			onClick={() => signIn('discord')}
			style={{
				backgroundColor: '#5865F2',
				color: '#FFFFFF',
				padding: '10px 20px',
				borderRadius: '20px',
				display: 'block',
				margin: '0 auto'
			}}
		>
			Sign In with Discord
		</button>
	);
}
