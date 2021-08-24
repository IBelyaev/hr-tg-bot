import { Telegraf, session, Scenes } from 'telegraf';
import mongoose from 'mongoose';

import { AllContext, StartPayload } from './types';
import main from './scenes/main';
import quiz from './scenes/quiz';

const { Stage } = Scenes;
const { TOKEN } = process.env;
const stage = new Stage([main, quiz]);
const bot = new Telegraf<AllContext>(TOKEN);

mongoose.connect('mongodb://localhost/database', {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
  bot.use(session());

  bot.use(stage.middleware());

  bot.start((ctx: AllContext & StartPayload) => {
    // TODO: будем юзать для получения инфы по клиенту
    console.log(`User token is ${ctx.startPayload}`);

    ctx.scene.enter('main');
  });

  bot.launch();

  console.log('Bot is started');
});
