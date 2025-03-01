import React from 'react'
import EndpointsList from '../endpoints-list'
import DialogButton from '../dialog-button'
import EndpointForm from '../endpoint-management-form'
import { Plus } from 'lucide-react'

const EndpointManagement = () => {
  return (
    <main className="container mx-auto p-8 flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-center">Mock API Server</h1>
      <DialogButton
        content={<EndpointForm />}
        className='w-fit ml-auto'
      >
        <Plus className='size-6 mr-2' />
        Create Endpoint
      </DialogButton>
      <EndpointsList />
    </main>
  )
}

export default EndpointManagement