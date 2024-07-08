import { auth } from '@/auth'
import type {NextPage} from 'next'
import SignOut from './buttons/signOut'
import SignInWithDiscord from './buttons/signIn'

const Home: NextPage = async () => {
  const session = await auth()

  if (session) {
    return (
      <>
        You're signed in! Congratulations! <br />
        <SignOut />
      </>
    )
  }

  return (
    <>
      <br/>
      <SignInWithDiscord />
    </>
  )
}

export default Home
