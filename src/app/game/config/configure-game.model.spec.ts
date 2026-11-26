import { CivGame, Game } from "pydt-shared";
import { ConfigureGameModel } from "./configure-game.model";

const civGame = {
  id: "CIV6",
  mapSizes: [
    { key: "DUEL", players: 2 },
    { key: "TINY", players: 4 },
    { key: "SMALL", players: 6 },
  ],
  maps: [],
  gameSpeeds: [{ key: "STANDARD" }],
} as unknown as CivGame;

const model = (slots: number, humans: number) => {
  const m = new ConfigureGameModel(civGame);

  m.initialize({ slots, humans } as Game);

  return m;
};

describe("ConfigureGameModel slots", () => {
  it("drops the AI slot before a human one (forum #10421)", () => {
    const m = model(4, 3);

    m.slots = 3;

    expect(m.slots).toBe(3);
    expect(m.humans).toBe(3);
  });

  it("only drops human slots once the AI slots are gone", () => {
    const m = model(6, 4);

    m.slots = 3;

    expect(m.humans).toBe(3);
  });

  it("still adds human slots when slots go up", () => {
    const m = model(4, 3);

    m.slots = 6;

    expect(m.humans).toBe(5);
  });

  it("handles the string value the range input sends", () => {
    const m = model(4, 3);

    m.slots = "3" as unknown as number;

    expect(m.slots).toBe(3);
    expect(m.humans).toBe(3);
  });
});
