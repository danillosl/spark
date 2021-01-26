export class StateMachineException implements Error {
  constructor(message: string = 'State Machine Exception', stack?: string) {
    this.message = message
    this.name = 'StateMachineException'
    this.stack = stack
  }
  message: string
  name: string
  stack?: string
}
