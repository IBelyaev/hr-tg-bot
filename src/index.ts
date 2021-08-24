import { Telegraf, session, Scenes } from 'telegraf';

import { AllContext, StartPayload } from './types';
import main from './scenes/main';
import quiz from './scenes/quiz';

const { Stage } = Scenes;
const { TOKEN } = process.env
const stage = new Stage([main, quiz]);
const bot = new Telegraf<AllContext>(TOKEN);

bot.use(session());
bot.use(stage.middleware());

bot.start((ctx: AllContext & StartPayload) => {
  console.log(`User token is ${ctx.startPayload}`);

  ctx.scene.enter('main');
})

bot.launch();
