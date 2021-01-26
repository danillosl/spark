import { contextPayloadFunction } from './contextPayloadFunction'
import { StateMachineException } from './StateMachineException'

export type StateMahchineDescriptor<
  Context,
  State extends string | number,
  Event extends string | number
> = {
  initialState: State
  beforeTransition?: contextPayloadFunction<Context>
  afterTransition?: contextPayloadFunction<Context>
  retry?: {
    error: typeof StateMachineException
    action: contextPayloadFunction<Context>
  }
  states: {
    [Key in State]?: {
      [Key in Event]?: {
        target: State
        action: contextPayloadFunction<Context>
        catch?: [
          {
            error: typeof Error
            action: contextPayloadFunction<Context>
            target: State
          }
        ]
      }
    }
  }
}
