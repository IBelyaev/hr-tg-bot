import { Scenes, Markup } from 'telegraf';

import { AllContext } from '../types';
import { UserDocument } from '#/models';
import { SceneNames } from './types';

type MainState = {
    user: UserDocument;
};

const { BaseScene } = Scenes;
const { button, inlineKeyboard } = Markup;
const main = new BaseScene<AllContext>(SceneNames.main);

main.enter((ctx) => {
    if (isMainSate(ctx.session.__scenes.state)) {
        const { name } = ctx.session.__scenes.state.user;

        const buttons = [
            [button.callback('Да!', 'go_to_quiz')],
            [button.callback('Пройду чуть позже)', 'schedule_quiz')],
        ];

        ctx.reply(
            `Привет, ${getCapitalizeName(name)}! Это бот для проведения скрининга! Готов пройти его сейчас, это займет не более 5 минут?` +
            'Правила скрининга очень простые, несколько вопросов с вариантами ответов. Но предупреждаю, время на ответ ограничено)',
            inlineKeyboard(buttons)
        );
    }
});

main.action('go_to_quiz', async (ctx) => {
    await ctx.reply('Супер! Тогда приступим!');

    if (isMainSate(ctx.session.__scenes.state)) {
        const {
            currentQuestion = 0,
            userGoals = 0
        } = ctx.session.__scenes.state.user;
        const initialState = {currentQuestion, userGoals};

        ctx.scene.enter(SceneNames.quiz, initialState);
    }
});

main.action('schedule_quiz', async (ctx) => {
    await ctx.reply('Хорошо, не буду тебе мешать)');

    ctx.reply('Чтобы начать заново отправь плез /start )');
});

export default main;

function isMainSate(state: object): state is MainState {
    return state.hasOwnProperty('user');
}

function getCapitalizeName(name = ''): string {
    const [firstWord = '', ...rest] = name.toLocaleLowerCase().split('');

    return firstWord.toUpperCase() + rest.join('');
}