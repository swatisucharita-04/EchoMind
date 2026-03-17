import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import AnimatedBackground from '@/components/common/AnimatedBackground'
import { useUIStore } from '@/store/uiStore'

export default function AppLayout() {
  const { sidebarOpen, currentMood } = useUIStore()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 relative">
      {/* Mood-aware animated background */}
      <AnimatedBackground mood={currentMood} />

      <Sidebar />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-[margin] duration-200 ease-in-out relative z-10 ${
          sidebarOpen ? 'ml-56' : 'ml-14'
        }`}
      >
        <TopBar />
        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
