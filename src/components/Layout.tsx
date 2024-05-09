import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from 'components/Navbar'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Layout(props: { role: string; setSection: any }) {
  return (
    <div className="flex flex-col">
      <Navbar role={props.role} setSection={props.setSection} />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
