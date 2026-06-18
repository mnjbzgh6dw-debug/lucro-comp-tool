import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { AppProvider, useApp } from './AppContext'
import Logo from './components/shared/Logo'
import Wizard from './components/wizard/Wizard'
import Dashboard from './components/dashboard/Dashboard'
import PrintLayout from './components/print/PrintLayout'

function TopBar({ onPrint }) {
  return (
    <header className="no-print sticky top-0 z-30 bg-navy text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Logo className="h-7 w-auto" wordmarkClass="text-lg" />
          <span className="text-white/40">|</span>
          <span className="font-display text-sm font-medium tracking-wide text-white/90">
            Compensation Prep Tool
          </span>
        </div>
        <button
          onClick={onPrint}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy transition hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold/50"
        >
          Print One-Pager
        </button>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="no-print mt-12 bg-navy py-4 text-center text-xs text-white/70">
      © Lucro Financial · morelucro.com · Confidential — for planning purposes only
    </footer>
  )
}

function Shell() {
  const { phase, profile } = useApp()
  const printRef = useRef(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Lucro_Comp_${(profile.teamMemberName || 'TeamMember').replace(/\s+/g, '')}_${profile.date}`,
  })

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar onPrint={handlePrint} />

      <main className="no-print flex-1">
        {phase === 'wizard' ? <Wizard /> : <Dashboard />}
      </main>

      <Footer />

      {/* Off-screen one-pager; revealed only inside the print context. */}
      <div className="print-only" aria-hidden="true">
        <div ref={printRef}>
          <PrintLayout />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
