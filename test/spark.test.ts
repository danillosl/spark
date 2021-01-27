import { Queue } from '../src/ActionQueue'
import { Context } from '../src/Context'
import { FiniteStateMachine } from '../src/FiniteStateMachine'
import { StateMachineException } from '../src/StateMachineException'

enum SagaEvents {
  EVENT_A = 'EVENT_A',
  EVENT_B = 'EVENT_B',
  EVENT_C = 'EVENT_C'
}

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

enum SagaStates {
  STATE_A = 'STATE_A',
  STATE_B = 'STATE_B',
  STATE_C = 'STATE_C'
}

class Entity implements Context<SagaStates> {
  id?: string
  teste?: number
  state: SagaStates = SagaStates.STATE_A
}

class CustomStateMachineException extends StateMachineException {
  constructor(message: string, stack?: string) {
    super(message)
    this.name = 'StateMachineException'
    this.message = message
    this.stack = stack
  }
  name: string
  message: string
  stack?: string
}

class CustomStateMachineException2 extends StateMachineException {
  constructor(message: string, stack?: string) {
    super(message)
    this.name = 'StateMachineException'
    this.message = message
    this.stack = stack
  }
  name: string
  message: string
  stack?: string
}

/**
 * Dummy test
 */
describe('Dummy test', async () => {
  const stateMachine = new FiniteStateMachine<Entity, SagaStates, SagaEvents>(
    {
      initialState: SagaStates.STATE_A,
      beforeTransition: (context, payload) => {
        console.log(`before transition ${JSON.stringify(context)} : ${JSON.stringify(payload)}`)
      },
      afterTransition: (context, payload) => {
        console.log(`after transition ${JSON.stringify(context)} : ${JSON.stringify(payload)}`)
      },
      retry: {
        error: CustomStateMachineException,
        action: (context, payload) => {
          console.log(`retry action ${JSON.stringify(context)} : ${JSON.stringify(payload)}`)
        }
      },
      states: {
        [SagaStates.STATE_A]: {
          [SagaEvents.EVENT_A]: {
            target: SagaStates.STATE_B,
            action: (context, payload, state) => {
              console.log(
                `state action A event A ${JSON.stringify(context)} : ${JSON.stringify(payload)}`
              )
              state.dispatch({
                type: SagaEvents.EVENT_B,
                payload: { param3: 'event b' }
              })
            },
            catch: [
              {
                error: Error,
                action: (context, payload) => {
                  console.log(
                    `error action state A ${JSON.stringify(context)} : ${JSON.stringify(payload)}`
                  )
                },
                target: SagaStates.STATE_A
              }
            ]
          }
        },
        [SagaStates.STATE_B]: {
          [SagaEvents.EVENT_B]: {
            target: SagaStates.STATE_C,
            action: (context, payload, machine) => {
              console.log(
                `state action B event B ${JSON.stringify(context)} : ${JSON.stringify(payload)}`
              )

              machine.dispatch({
                type: SagaEvents.EVENT_C,
                payload: { param4: 'event c' }
              })
            }
          }
        },
        [SagaStates.STATE_C]: {
          [SagaEvents.EVENT_C]: {
            target: SagaStates.STATE_A,
            action: async (context, payload) => {
              console.log('start action event c')
              await timeout(4000)
              console.log('end action event c')
              throw new CustomStateMachineException('retry')
            }
          }
        }
      }
    },
    new Entity()
  )

  stateMachine.dispatch({
    type: SagaEvents.EVENT_A,
    payload: { param1: 'event a' }
  })

  stateMachine.dispatch({
    type: SagaEvents.EVENT_A,
    payload: { param2: 'event a2' }
  })

  // const actionQueue = new Queue<number>()
  // actionQueue.enqueue(1)
  // console.log(actionQueue)
  // actionQueue.enqueue(2)
  // console.log(actionQueue)
  // actionQueue.enqueue(3)
  // console.log(actionQueue)
  // console.log(actionQueue.dequeue())
  // console.log(actionQueue.dequeue())
  // console.log(actionQueue.dequeue())
  // console.log(actionQueue.dequeue())
})
