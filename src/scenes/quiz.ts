import { Scenes, Markup } from 'telegraf';
import { CallbackQuery } from 'typegram/callback';
import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

import { AllContext, QuizSessionData } from '../types';

type AnswerButton = {
    id: string;
    text: string;
    isRight: boolean;
};

type Question = {
    id: string;
    text: string;
    buttons: AnswerButton[];
};

type QuestionArgs = {
    text: string;
    answerButtons: Markup.Markup<InlineKeyboardMarkup>;
};

const { button: { callback: callbackButton }, inlineKeyboard } = Markup;
const { BaseScene } = Scenes;
const quiz = new BaseScene<AllContext>('quiz');

const MOCK_QUESTIONS: Question[] = [
    {
        id: '1',
        text: 'Сколько будет 1 + 1',
        buttons: [
            {
                text: '2',
                id: '1_1',
                isRight: true,
            },
            {
                text: '69',
                id: '1_1',
                isRight: false,
            },
            {
                text: 'Паша техник',
                id: '1_1',
                isRight: false,
            },
            {
                text: 'Нолик',
                id: '1_1',
                isRight: false,
            }
        ],
    },
    {
        id: '2',
        text: 'Игорян - это',
        buttons: [
            {
                text: 'Калужский парень',
                id: '1_1',
                isRight: false,
            },
            {
                text: 'Ловушкиш джокера',
                id: '1_1',
                isRight: true,
            }
        ],
    },
    {
        id: '3',
        text: 'Филипок - это',
        buttons: [
            {
                text: 'Произведение',
                id: '1_1',
                isRight: true,
            },
            {
                text: 'Филип у которого все Ок',
                id: '1_1',
                isRight: false,
            },
            {
                text: 'Все варианты не верные',
                id: '1_1',
                isRight: false,
            }
        ],
    },
    {
        id: '4',
        text: 'Что выведет в консоль если бы мы запустили это в браузере?\n\n' + 'function foo() {\n    console.log(this);\n}\n\nfoo();',
        buttons: [
            {
                text: 'Window',
                id: '1_1',
                isRight: true,
            },
            {
                text: 'undefined',
                id: '1_1',
                isRight: false,
            },
            {
                text: 'null',
                id: '1_1',
                isRight: false,
            },
            {
                text: 'foo',
                id: '1_1',
                isRight: false,
            }
        ],
    },
    {
        id: '5',
        text: 'А в таком случае?\n\n' + 'const a = {};\nfunction foo() {\n    console.log(this);\n}\n\nfoo.call(a);',
        buttons: [
            {
                text: '{}',
                id: '1_1',
                isRight: true,
            },
            {
                text: 'Window',
                id: '1_1',
                isRight: false,
            },
            {
                text: 'вызов foo не произойдет',
                id: '1_1',
                isRight: false,
            },
            {
                text: 'foo',
                id: '1_1',
                isRight: false,
            }
        ],
    }
];

let QUESTION_TIMEOUT: NodeJS.Timeout = null;
let SECONDS_INTERVAL: NodeJS.Timeout = null;

quiz.enter((ctx) => {
    sendQuizAnswer(ctx);
});

quiz.action('next_question', (ctx) => {
    sendQuizAnswer(ctx);
});

quiz.on('callback_query', async (ctx) => {
    const { callback_query } = ctx.update;

    if (isQuizSate(ctx.session.__scenes.state) && ctx.session.__scenes.state.currentQuestion < MOCK_QUESTIONS.length) {
        setNextQuestion(ctx);

        if (isCallbackHasData(callback_query) && isQuizSate(ctx.session.__scenes.state) && callback_query.data === 'sended_right_answer') {
            ctx.session.__scenes.state.userGoals = ctx.session.__scenes.state.userGoals + 1;
        }
    
        sendQuizAnswer(ctx);
    }
});

export default quiz;

async function sendQuizAnswer(ctx: AllContext): Promise<void> {
    clearAllTimers();

    if (isQuizSate(ctx.session.__scenes.state)) {
        if (ctx.session.__scenes.state.currentQuestion >= MOCK_QUESTIONS.length) {
            ctx.reply(
                'Вы ответили верно на ' + ctx.session.__scenes.state.userGoals
            );
        } else {
            const { text, answerButtons } = getQuestionArgs(ctx.session.__scenes.state.currentQuestion, ctx);
    
            setActionToInterval(() => {
                sendTimeoutMessage(ctx);
            });
    
            await ctx.reply(text, answerButtons);
            
            await sendTimerForAnswer(ctx);
        }
    }
}

async function sendTimerForAnswer(ctx: AllContext) {
    let seconds = 60;
    const stopwatchNode = await ctx.reply('Времени на вопрос ' + seconds);
    const ONE_SECOND = 1000;

    SECONDS_INTERVAL = setInterval(() => {
        seconds -= 1;

        if (seconds >= 0) {
            ctx.telegram.editMessageText(
                stopwatchNode.chat.id,
                stopwatchNode.message_id,
                undefined,
                'Времени на вопрос ' + (seconds >= 10 ? seconds : `0${seconds}`),
            );
        }
    }, ONE_SECOND)
}

function clearAllTimers() {
    if (QUESTION_TIMEOUT) {
        clearTimeout(QUESTION_TIMEOUT);
    };

    if (SECONDS_INTERVAL) {
        clearInterval(SECONDS_INTERVAL);
    };
}

function getQuestionArgs(questionIndex: number, ctx: AllContext): QuestionArgs {
    return {
        text: MOCK_QUESTIONS[questionIndex].text,
        answerButtons: getQuestionsButton(questionIndex, ctx),
    }
}

function getQuestionsButton(questionIndex: number, ctx: AllContext): Markup.Markup<InlineKeyboardMarkup> {
    const buttons = MOCK_QUESTIONS[questionIndex].buttons.map(({text, isRight}) => (
        [callbackButton(text, isRight ? 'sended_right_answer' : 'sended_wrong_answer')]
    ));

    return inlineKeyboard(buttons);
}

function sendTimeoutMessage(ctx: AllContext): void {
    setNextQuestion(ctx);

    ctx.reply(
        (
            'Прости но время вышло(((((((( ' +
            'Чтобы перейти к следующему вопросу нажми кнопку далее'
        ),
        inlineKeyboard([callbackButton('Перейти к след вопросу', 'next_question')])
    )
}

function setNextQuestion(ctx: AllContext): void {
    if (isQuizSate(ctx.session.__scenes.state)) {
        ctx.session.__scenes.state.currentQuestion = ctx.session.__scenes.state.currentQuestion + 1;
    }
}

function setActionToInterval(callback: (args: unknown) => void): void {
    QUESTION_TIMEOUT = setTimeout(callback, 60000);
}

function isCallbackHasData(callbackQuery: CallbackQuery): callbackQuery is CallbackQuery.DataCallbackQuery {
    if (callbackQuery.hasOwnProperty('data'))  {
        return true;
    }

    return false;
}

function isQuizSate(state: object): state is QuizSessionData {
    if (state.hasOwnProperty('currentQuestion') && state.hasOwnProperty('userGoals'))  {
        return true;
    }

    return false;
}