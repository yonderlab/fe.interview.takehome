import { useLoaderData, useNavigate } from 'react-router'
import { estimateLoader, type Estimate } from '@loaders/estimate'
import { clsx } from 'clsx'
import Button from '@ui/Button'
import AgentMessage from '@ui/AgentMessage'
import Shield from '@ui/Shield'

export const loader = estimateLoader

export default function YourPlanPage() {
  const estimate = useLoaderData() as Estimate
  const navigate = useNavigate()

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(cents / 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalised':
        return 'bg-green-100 text-green-800'
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const formatText = (text: string) => {
    return text.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const handleMakeAnotherBooking = () => {
    navigate('/welcome')
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <AgentMessage text="Congratulations on your booking! Here is the details of your plan ✨" />
        </div>

        {/* Plan Information */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-gray-700">
              {estimate.plan.name}
            </h2>
            <span className={clsx('inline-block px-3 py-2 rounded-full text-xs font-semibold', getStatusColor(estimate.status))}>
              {formatText(estimate.status)}
            </span>
          </div>
       
          <div className="flex flex-wrap gap-2">
            {Object.entries(estimate.selections).map(([key, value]) => {
              const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
              const displayValue = Array.isArray(value)
                ? value.map(formatText).join(', ')
                : formatText(String(value))
              return !!displayValue && (
                <Shield key={key}>
                  <span className="font-medium mr-1">{displayKey}:</span>
                  <span>{displayValue}</span>
                </Shield>
              )
            })}
          </div>
     
          <div className="space-y-3 px-1 pt-4">
            <div className="flex justify-between text-gray-700">
              <span>Base Price:</span>
              <span className="font-medium">{formatPrice(estimate.pricing.base, estimate.pricing.currency)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Add-ons:</span>
              <span className="font-medium">{formatPrice(estimate.pricing.addons, estimate.pricing.currency)}</span>
            </div>
            <div className="border-t border-gray-300 pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-xl font-semibold text-gray-900">Total:</span>
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(estimate.pricing.total, estimate.pricing.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>



        {/* Blocking Reasons (if any) */}
        {estimate.blocking_reasons.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Issues</h2>
            <ul className="list-disc list-inside space-y-1">
              {estimate.blocking_reasons.map((reason, index) => (
                <li key={index} className="text-red-700">{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Make Another Booking Button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleMakeAnotherBooking}
            color="light"
          >
            Make another booking
          </Button>
        </div>
      </div>
    </main>
  )
}
