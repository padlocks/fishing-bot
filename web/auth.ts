import NextAuth from 'next-auth'
import { authConfig } from './auth.config';
import Discord from "next-auth/providers/discord"

// https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
const scopes = ['identify'].join(' ')
 
export const { handlers, signIn, signOut, auth } = NextAuth({ 
  providers: [Discord({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    profile: async (profile) => {
      let userAvatar = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
      return {
        id: profile.id,
        snowflake: profile.id,
        username: profile.username,
        image: userAvatar,
        name: profile.global_name
      }
    }
  })],
  pages: {
    signIn: "/login",
  },
})