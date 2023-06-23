import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id'
import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { chatHrefConstructor } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const page = async ({}) => {
  const session = await getServerSession(authOptions)
  if (!session) notFound()

  const friends = await getFriendsByUserId(session.user.id)

  const recentChats = await Promise.all(
    friends.map(async (friend) => {
      const [lastMessageRaw] = (await fetchRedis(
        'zrange',
        `chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`,
        -1,
        -1
      )) as string[]

      console.log({ lastMessageRaw });

      const lastMessage = lastMessageRaw ? JSON.parse(lastMessageRaw) as Message : undefined;

      return {
        ...friend,
        lastMessage,
      }
    })
  )

  return (
    <div className='container'>
      <h1 className='py-12 px-6 bg-indigo-600 text-white font-bold text-5xl mb-8'>Recent chats</h1>
      <div className='px-6'>
      {recentChats.length === 0 ? (
        <p className='text-sm text-zinc-500'>Nothing to show here...</p>
      ) : (
        recentChats.map((friend) => (
          <div
            key={friend.id}
            className='flex flex-row itemx-center bg-white border border-zinc-400 p-3 rounded-md mb-2'>
            <Link
              href={`/dashboard/chat/${chatHrefConstructor(
                session.user.id,
                friend.id
              )}`}
              className='relative flex-grow sm:flex'>
              <div className='mb-4 flex-shrink-0 sm:mb-0 sm:mr-4'>
                <div className='relative h-6 w-6'>
                  <Image
                    referrerPolicy='no-referrer'
                    className='rounded-full'
                    alt={`${friend.name} profile picture`}
                    src={friend.image}
                    fill
                  />
                </div>
              </div>

              <div className='flex-grow'>
                <h4 className='text-lg font-semibold'>{friend.name}</h4>
                {!!friend.lastMessage ? (
                  <p className='mt-1 w-full text-gray-400'>
                    <span className='text-zinc-400'>
                      {friend.lastMessage.senderId === session.user.id
                        ? 'You: '
                        : ''}
                    </span>
                    {friend.lastMessage.text.substring(0, 50)+'...'}
                  </p>
                ) : (
                  <p className='mt-1 w-full text-gray-400'>
                  Send a message to start a conversation!
                </p>
                )}
              </div>
            </Link>
            <div className='flex items-center'>
              <ChevronRight className='h-7 w-7 text-zinc-400' />
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  )
}

export default page
