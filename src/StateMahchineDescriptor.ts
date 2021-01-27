import { contextPayloadFunction } from './contextPayloadFunction'
import { FiniteStateMachine } from './FiniteStateMachine'
import { Context } from './spark'
import { StateMachineException } from './StateMachineException'

export type StateMahchineDescriptor<
  C extends Context<S>,
  S extends string | number,
  E extends string | number
> = {
  initialState: S
  beforeTransition?: contextPayloadFunction<C, FiniteStateMachine<C, S, E>>
  afterTransition?: contextPayloadFunction<C, FiniteStateMachine<C, S, E>>
  retry?: {
    error: typeof StateMachineException
    action: contextPayloadFunction<C, FiniteStateMachine<C, S, E>>
  }
  states: {
    [Key in S]?: {
      [Key in E]?: {
        target: S
        action: contextPayloadFunction<C, FiniteStateMachine<C, S, E>>
        catch?: [
          {
            error: typeof Error
            action: contextPayloadFunction<C, FiniteStateMachine<C, S, E>>
            target: S
          }
        ]
      }
    }
  }
}
