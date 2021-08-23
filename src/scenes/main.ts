import { Scenes, Markup } from 'telegraf';

import { AllContext } from '../types';

const initialState = {
    currentQuestion: 0,
    userGoals: 0,
};

const { BaseScene } = Scenes;
const { button, inlineKeyboard } = Markup;
const main = new BaseScene<AllContext>('main');

main.enter((ctx) => {
    const buttons = [
        [button.callback('Да!', 'go_to_quiz')],
        [button.callback('Пройду чуть позже)', 'schedule_quiz')],
    ];

    ctx.reply(
        'Привет! Это бот для проведения скрининга! Готов пройти его сейчас, это займет не более 5 минут?' +
        'Правила скрининга очень простые, несколько вопросов с вариантами ответов. Но предупреждаю, время на ответ ограничено)',
        inlineKeyboard(buttons)
    );
});

main.action('go_to_quiz', async (ctx) => {
    await ctx.reply('Супер! Тогда приступим!');

    ctx.scene.enter('quiz', initialState);
});

main.action('schedule_quiz', async (ctx) => {
    await ctx.reply('Хорошо, не буду тебе мешать)');

    ctx.reply('Чтобы начать заново отправь плез /start )');
});

export default main;
