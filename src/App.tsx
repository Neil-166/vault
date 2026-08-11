import { type ComponentType, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Navigation } from './components/Navigation'
import { Toasts } from './components/ui/Toasts'
import { useVault, type Route } from './store/useVault'
import LandingScreen from './screens/LandingScreen'
import LockScreen from './screens/LockScreen'
import Dashboard from './screens/Dashboard'
import ActivityScreen from './screens/ActivityScreen'
import GoalsScreen from './screens/GoalsScreen'
import ProfileScreen from './screens/ProfileScreen'
import SendScreen from './screens/SendScreen'
import RequestScreen from './screens/RequestScreen'
import SplitScreen from './screens/SplitScreen'
import SplitDetailScreen from './screens/SplitDetailScreen'
import GoalDetailScreen from './screens/GoalDetailScreen'
import AddMoneyScreen from './screens/AddMoneyScreen'
import NotificationsScreen from './screens/NotificationsScreen'
import AnalyticsScreen from './screens/AnalyticsScreen'
import TransactionDetailScreen from './screens/TransactionDetailScreen'
import SecurityScreen from './screens/SecurityScreen'
import DevicesScreen from './screens/DevicesScreen'
import SettingsScreen from './screens/SettingsScreen'
import PrivacyScreen from './screens/PrivacyScreen'
import HelpScreen from './screens/HelpScreen'

const SCREENS: Partial<Record<Route['name'], ComponentType>> = {
  home: Dashboard,
  activity: ActivityScreen,
  goals: GoalsScreen,
  profile: ProfileScreen,
  send: SendScreen,
  request: RequestScreen,
  split: SplitScreen,
  splitDetail: SplitDetailScreen,
  goalDetail: GoalDetailScreen,
  addMoney: AddMoneyScreen,
  notifications: NotificationsScreen,
  insights: AnalyticsScreen,
  transaction: TransactionDetailScreen,
  security: SecurityScreen,
  devices: DevicesScreen,
  settings: SettingsScreen,
  privacy: PrivacyScreen,
  help: HelpScreen,
}

export default function App() {
  const [landed, setLanded] = useState(false)
  const locked = useVault((s) => s.locked)
  const unlock = useVault((s) => s.unlock)
  const route = useVault((s) => s.route)
  const theme = useVault((s) => s.theme)

  if (!landed) return <LandingScreen onEnter={() => setLanded(true)} />
  if (locked) return <LockScreen onUnlock={unlock} />

  const Screen = SCREENS[route.name] ?? Dashboard
  const transitionKey = route.name === 'home' ? 'home' : route.name

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`} style={{ backgroundColor: 'var(--vault-bg)', color: 'var(--vault-text)' }}>
      <Navigation />
      <div className="lg:pl-64">
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={transitionKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mx-auto w-full max-w-3xl px-4 pt-5 pb-28 lg:px-8 lg:pb-16"
          >
            <Screen />
          </motion.main>
        </AnimatePresence>
      </div>
      <Toasts />
    </div>
  )
}
