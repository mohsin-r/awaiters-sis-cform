import React from 'react'
import { Outlet } from 'react-router-dom'
import TeacherNavbar from 'components/navbar/Teacher'
import AdminNavbar from 'components/navbar/Admin'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Layout(props: { role: string; setSection: any }) {
  return (
    <div className="flex flex-col">
      {props.role === 'teacher' && (
        <TeacherNavbar setSection={props.setSection} />
      )}
      {props.role === 'admin' && <AdminNavbar setSection={props.setSection} />}
      <main>
        <Outlet />
      </main>
    </div>
  )
}
