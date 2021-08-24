import { SceneContext } from 'telegraf/typings/scenes';
import { Context } from 'telegraf';

export type QuizSessionData = {
    currentQuestion: number;
    userGoals: number;
};

export type StartPayload = {
    startPayload: string;
};

export type AllContext = Context & SceneContext;
