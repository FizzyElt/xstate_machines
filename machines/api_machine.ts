import { createMachine, fromPromise, assign } from 'xstate';

type ApiMachineContext<T> =
  | {
      status: 'idle';
    }
  | {
      status: 'pending';
    }
  | {
      status: 'success';
      data: T;
    }
  | {
      status: 'fail';
      error: unknown;
    };

type ApiMachineEvent<P> =
  | {
      type: 'START';
      params: P;
    }
  | {
      type: 'REFETCH';
      params: P;
    };

export const createApiMachine = <P, T>(fn: (params: P) => Promise<T>) =>
  createMachine({
    types: {} as {
      context: ApiMachineContext<T>;
      evens: ApiMachineEvent<P>;
    },
    context: { status: 'idle' },
    initial: 'idle',
    states: {
      idle: {
        on: {
          START: 'pending',
        },
      },
      pending: {
        entry: assign<ApiMachineContext<T>>({ status: 'pending' }),
        invoke: {
          src: fromPromise<T, P>(({ input: params }) => fn(params)),
          input: ({ event: { params } }) => params,

          onDone: {
            target: 'resolved',
            actions: assign<ApiMachineContext<T>>(({ event }) => ({
              status: 'success',
              data: event.output,
            })),
          },
          onError: {
            target: 'rejected',
            actions: assign<ApiMachineContext<T>>(({ event }) => ({
              status: 'fail',
              data: event.error,
            })),
          },
        },
      },
      resolved: {
        on: {
          REFETCH: 'pending',
        },
      },
      rejected: {
        on: {
          REFETCH: 'pending',
        },
      },
    },
  });

export type ApiStateMachine<P, T> = ReturnType<typeof createApiMachine<P, T>>;
