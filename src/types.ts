import { SceneContext } from 'telegraf/typings/scenes';
import { Context } from 'telegraf';

export type QuizSessionData = {
    currentQuestion: number;
    userGoals: number;
};

export type AllContext = Context & SceneContext;
