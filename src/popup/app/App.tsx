import { Header } from './header/Header'
import { Settings } from './settings/Settings'
import styles from './app.module.css'

export const App = () => {
  return (
    <div className={styles.app}>
      <Header />
      <Settings />
    </div>
  )
}
