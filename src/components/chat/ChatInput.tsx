'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  placeholder?: string
  disabled?: boolean
}

export default function ChatInput({ 
  onSendMessage, 
  placeholder = "How can Huma help you?",
  disabled = false 
}: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState('')

  const handleSendMessage = () => {
    if (inputMessage.trim() && !disabled) {
      onSendMessage(inputMessage.trim())
      setInputMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    target.style.height = 'auto'
    target.style.height = target.scrollHeight + 'px'
  }

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <div className="flex items-center space-x-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200 focus-within:border-transparent focus-within:ring-0">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1 resize-none border-0 bg-transparent focus:ring-0 focus:outline-none focus:border-0 text-gray-700 placeholder-gray-400 min-h-[24px] max-h-32 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              rows={1}
              style={{
                height: 'auto',
                overflow: 'hidden'
              }}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || disabled}
              size="sm"
              className={`rounded-full p-2 transition-colors ${
                inputMessage.trim() && !disabled
                  ? 'bg-primary hover:bg-primary/90 text-white' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 px-4">
            <p className="text-xs text-gray-500">
              Press Enter to send, Shift+Enter for new line
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Powered by Huma GPT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
