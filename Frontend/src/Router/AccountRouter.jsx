import React from 'react'
import Accounts from '../components/Accounts/Accounts'
import Booking_infromation from '../components/Accounts/Booking_infromation'
import Edit_profile from '../components/Accounts/Edit_profile'

export default function AccountRouter() {
  return (
    <div>
      <Accounts/>
      <Booking_infromation/>
      <Edit_profile/>
    </div>
  )
}
