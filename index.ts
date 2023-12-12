import { createActor } from 'xstate';
import { createApiMachine } from './machines/api_machine';

const delay = <T>(ms: number, result?: T): Promise<T | undefined> =>
  new Promise((resolve) => setTimeout(() => resolve(result), ms));

const fakeApi = (str: string = '') => delay(1000, str);

const machine = createApiMachine(fakeApi);

const myActor = createActor(machine);

myActor.subscribe((snapshot) => {
  const { context, value } = snapshot;
  console.log(value, JSON.stringify(context, null, 2));
});

Promise.resolve(myActor.start())
  .then(() => myActor.send({ type: 'START', params: 'hello world' }))
  .then(() => delay(10000));
