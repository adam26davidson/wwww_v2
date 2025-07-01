export type Sentence = {
  who: string;
  what: string;
  where: string;
  why: string;
};

export type Player = {
  name: string;
  isDone: Boolean;
  response: Sentence;
};
