import Convergence, { when, always, isConvergence } from '@bigtest/convergence';

when<string>(() => 'hello world').then(v => v.value.toUpperCase());
when(() => true).then(() => {});

always(() => true);
always(() => 'hello world').then(v => v.value.toUpperCase());

isConvergence('hello world');

let c = new Convergence(4000);

c.timeout().toFixed();
c.timeout(2000)
  .run()
  .then(() => {});

c.when(() => 'hello world')
  .run()
  .then(v => v.value.toUpperCase());

c.always(() => 'hello world')
  .run()
  .then(v => v.value.toUpperCase());
  
c.when(() => 'hello world')
  .do(message => new Promise(resolve => resolve(message)))
  .then();

// TODO: include case when then takes an argument

c.append(new Convergence(2000)).run().then(() => {});

