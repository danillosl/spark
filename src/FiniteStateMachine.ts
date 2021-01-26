import { Action } from './Action'
import { Context } from './Context'
import { StateMahchineDescriptor } from './StateMahchineDescriptor'

export class FiniteStateMachine<
  C extends Context<S>,
  S extends string | number,
  E extends string | number
> {
  private readonly _context: C
  private _stateMachineDescriptor: StateMahchineDescriptor<C, S, E>

  constructor(stateMachineDescriptor: StateMahchineDescriptor<C, S, E>, context: C) {
    this._stateMachineDescriptor = stateMachineDescriptor
    this._context = context

    if (!this._context.state) this._context.state = this._stateMachineDescriptor.initialState
  }

  get context(): C {
    return this._context
  }

  public async dispatch(action: Action<E>) {
    const state = this._stateMachineDescriptor.states[this._context.state]
    if (!state) return

    const event = state[action.type]
    if (!event) return
    try {
      if (this._stateMachineDescriptor.beforeTransition) {
        await this._stateMachineDescriptor.beforeTransition(this._context, action)
      }
      await event.action(this.context, action.payload)
      this._context.state = event.target

      if (this._stateMachineDescriptor.afterTransition) {
        await this._stateMachineDescriptor.afterTransition(this._context, action)
      }
    } catch (err) {
      const { retry } = this._stateMachineDescriptor

      if (retry && err instanceof retry.error) {
        retry.action(this._context, action.payload)
      }

      if (!event.catch) throw new err()

      for (const catchObject of event.catch) {
        if (err instanceof catchObject.error) {
          await catchObject.action(this.context, action.payload)
          this._context.state = catchObject.target
        }
      }
    }
  }
}
