'use client'

import axios from 'axios'
import { FC, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import TextareaAutosize from 'react-textarea-autosize'
import Button from './ui/Button'

interface ChatInputProps {
  chatPartner: User
  chatId: string
}

const ChatInput: FC<ChatInputProps> = ({ chatPartner, chatId }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [input, setInput] = useState<string>('')

  const sendMessage = async () => {
    if(!input) return
    setIsLoading(true)

    try {
      await axios.post('/api/message/send', { text: input, chatId })
      setInput('')
      textareaRef.current?.focus()
    } catch {
      toast.error('Something went wrong. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex flex-row justify-between items-end'>
      <TextareaAutosize
        ref={textareaRef}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
          }
        }}
        rows={1}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={`Message ${chatPartner.name}`}
        maxRows={5}
        className='flex-grow block w-full resize-none text-gray-900 placeholder:text-gray-400 p-2 sm:text-sm sm:leading-5 border border-gray-400 focus:border-0 mb-2 sm:mb-0 rounded-lg overflow-hidden shadow-sm'
      />
      <div className='flex justify-between pl-3 pr-2'>
        <div className='flex-shrink-0'>
          <Button isLoading={isLoading} onClick={sendMessage} type='submit'>
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatInput
