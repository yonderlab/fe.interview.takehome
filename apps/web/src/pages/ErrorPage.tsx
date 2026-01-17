import { useRouteError, useNavigate } from 'react-router'
import { WarningCircle } from '@phosphor-icons/react'
import Button from '@ui/Button'
import AgentMessage from '@ui/AgentMessage'

export default function ErrorPage() {
  const error = useRouteError() as { status?: number; statusText?: string; data?: string; message?: string }
  const navigate = useNavigate()

  const errorData = error.data || error.message || 'an error occurred'
  const errorMessage = `Something didn’t work as expected! ${errorData} 🌀`

  const handleGoBack = () => {
    navigate('/welcome')
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <AgentMessage text={errorMessage} />
        </div>

        <div className="flex justify-center my-12">
          <WarningCircle size={96} className="text-gray-200" />
        </div>

        <div className="mt-8 flex justify-center">
          <Button onClick={handleGoBack} color="light">
            Go Back
          </Button>
        </div>
      </div>
    </main>
  )
}
