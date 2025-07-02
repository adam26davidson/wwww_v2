declare global {
  namespace PrismaJson {
    export type SentencePart = {
      name: string;
      response: string;
    };

    export type Sentence = {
      who: SentencePart;
      what: SentencePart;
      where: SentencePart;
      why: SentencePart;
    };

    export type Response = {
      who: string;
      what: string;
      where: string;
      why: string;
    };

    export type Player = {
      id: number;
      name: string;
      isDone: Boolean;
      response: Response | null;
    };
  }
}

// The file MUST be a module!
export {};
