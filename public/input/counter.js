export function counter(initialValue = 0) {
  let count = initialValue

  return {
    decrement: () => --count,
    increment: () => ++count,
    get count() {
      return count
    }
  }
}
