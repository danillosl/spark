import { contextActionFunction } from './contextActionFunction'
import { contextPayloadFunction } from './contextPayloadFunction'
import { Action, Context } from './spark'
import { StateMachineException } from './StateMachineException'

export type StateMahchineDescriptor<
  C extends Context<S>,
  S extends string | number,
  E extends string | number,
  EC
> = {
  initialState: S
  beforeTransition?: contextActionFunction<C, Action<E>, EC>
  afterTransition?: contextActionFunction<C, Action<E>, EC>
  retry?: contextActionFunction<C, Action<E>, EC>

  states: {
    [Key in S]?: {
      [Key in E]?: {
        target: S
        action: contextPayloadFunction<C, EC>
        catch?: [
          {
            error: typeof StateMachineException
            action: contextPayloadFunction<C, EC>
            target: S
          }
        ]
      }
    }
  }
}
