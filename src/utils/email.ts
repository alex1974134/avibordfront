const emailPattern = /^\S+@\S+\.\S+$/

export function isEmail(value: string): boolean {
  return emailPattern.test(value.trim())
}
