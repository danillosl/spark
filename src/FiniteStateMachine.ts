import { Action } from './Action'
import { Queue } from './ActionQueue'
import { Context } from './Context'
import { StateMahchineDescriptor } from './StateMahchineDescriptor'

export class FiniteStateMachine<
  C extends Context<S>,
  S extends string | number,
  E extends string | number
> {
  private actionQueue: Queue<Action<E>> = new Queue()
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
    this.actionQueue.enqueue(action)

    if (this.actionQueue.length() >= 2) return

    await this.executeAction(this.actionQueue.peek()!)
  }

  private async executeAction(action: Action<E>) {
    const state = this._stateMachineDescriptor.states[this._context.state]
    if (!state) {
      this.executeNextAction()
      return
    }

    const event = state[action.type]
    if (!event) {
      this.executeNextAction()
      return
    }

    try {
      if (this._stateMachineDescriptor.beforeTransition) {
        await this._stateMachineDescriptor.beforeTransition(this._context, action, this)
      }
      await event.action(this.context, action.payload, this)
      this._context.state = event.target

      if (this._stateMachineDescriptor.afterTransition) {
        await this._stateMachineDescriptor.afterTransition(this._context, action, this)
      }
    } catch (err) {
      const { retry } = this._stateMachineDescriptor

      if (retry && err instanceof retry.error) {
        retry.action(this._context, action.payload, this)
      }

      if (!event.catch) throw new err()

      for (const catchObject of event.catch) {
        if (err instanceof catchObject.error) {
          await catchObject.action(this.context, action.payload, this)
          this._context.state = catchObject.target
        }
      }
    } finally {
      this.executeNextAction()
    }
  }

  private executeNextAction() {
    this.actionQueue.dequeue()
    if (!this.actionQueue.isEmpty()) this.executeAction(this.actionQueue.peek()!)
  }
}
