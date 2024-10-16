import { counter } from './counter'
import { dateNow } from './module/date'
import './style.css'

const points = counter(40)
const button = document.createElement('button')
button.classList.add('inc')
button.textContent = 'Increment'
button.addEventListener('click', () => {
  points.increment()
  updateCount()
})

const count = document.createElement('span')
function updateCount() {
  count.textContent = `${points.count} points `
}

updateCount()
document.body.append(count, button)

console.log('Date now: ', dateNow)

// loaded from public/data.json
fetch('data.json')
  .then((req) => req.json())
  .then((data) => console.log(data))
