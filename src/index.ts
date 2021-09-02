import { Telegraf, session, Scenes } from 'telegraf';
import mongoose from 'mongoose';

import { AllContext, StartPayload } from './types';
import main from './scenes/main';
import authError from './scenes/auth-error';
import quiz from './scenes/quiz';
import { SceneNames } from './scenes/types';
import User from './models';

const { Stage } = Scenes;
const { TOKEN } = process.env;
const stage = new Stage([main, quiz, authError]);
const bot = new Telegraf<AllContext>(TOKEN);

// TODO: сделать retry для connect
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

  bot.start(async (ctx: AllContext & StartPayload) => {
    const [user] = await User.find({_id: ctx.startPayload});
    // TODO: вынести все названия сцен в enum
    const sceneName = user ? SceneNames.main : SceneNames.authError;

    console.log(`User token is ${ctx.startPayload}`);
    ctx.scene.enter(sceneName, {user});
  });

  bot.launch();
  console.log('Bot is started');
});
