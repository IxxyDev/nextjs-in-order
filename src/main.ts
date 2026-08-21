import './styles.css'
import { initScrollProgress } from './scroll-progress'

const sections = Array.from(document.querySelectorAll<HTMLElement>('.act'))
initScrollProgress(sections, (update) => {
  console.log(update.actId, update.overallProgress.toFixed(2))
})
