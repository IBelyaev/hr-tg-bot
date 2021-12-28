import { Telegraf, session, Scenes } from 'telegraf';
import mongoose from 'mongoose';

import { AllContext, StartPayload } from './types';
import main from './scenes/main';
import authError from './scenes/auth-error';
import finish from './scenes/finish';
import quiz from './scenes/quiz';
import { SceneNames } from './scenes/types';
import User from './models';

const { Stage } = Scenes;
const { TOKEN } = process.env;
const stage = new Stage([main, quiz, authError, finish]);
const bot = new Telegraf<AllContext>(TOKEN);

// TODO: сделать retry для connect
mongoose.connect('mongodb://mongo:27017/database', {
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
    try {
      const [user] = await User.find({_id: ctx.startPayload});
      console.log(`User token is ${ctx.startPayload}`);

      if (user) {
        const sceneName = user.isPassedScreening ? SceneNames.finish : SceneNames.main;

        ctx.scene.enter(sceneName, {user});
      } else {
        ctx.scene.enter(SceneNames.authError);
      }
    } catch(_e) {
      ctx.scene.enter(SceneNames.authError);
    }
  });

  bot.launch();
  console.log('Bot is started');
});
