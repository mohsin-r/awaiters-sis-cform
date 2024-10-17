import React from 'react'
import { Outlet } from 'react-router-dom'
import TeacherNavbar from 'components/navbar/Teacher'
import AdminNavbar from 'components/navbar/Admin'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Layout(props: { role: string; setSection: any }) {
  return (
    <div className="flex min-h-screen flex-col">
      {props.role === 'teacher' && (
        <TeacherNavbar setSection={props.setSection} />
      )}
      {props.role === 'admin' && <AdminNavbar setSection={props.setSection} />}
      <main className="relative grow">
        <Outlet />
      </main>
    </div>
  )
}
