import { Utility } from "./utility";

const sortBy = (rows: Record<string, unknown>[], sort: "asc" | "desc") => {
  const config = {
    sorting: { columns: [{ name: "avg", sort }] },
    filtering: { filterString: "", filteredResults: 0 },
    paging: { page: 1, itemsPerPage: 25 },
    columns: [{ name: "avg", sort }],
  };
  const data = [...rows];

  Utility.onChangeTable(config, data, []);

  return data.map(x => x.id);
};

describe("Utility.onChangeTable sorting", () => {
  const rows = [
    { id: "none", avg: "", avg_sort: null },
    { id: "slow", avg: "2 days", avg_sort: 172800 },
    { id: "nan", avg: "", avg_sort: NaN },
    { id: "fast", avg: "1 hour", avg_sort: 3600 },
    { id: "zero", avg: "0 seconds", avg_sort: 0 },
  ];

  it("puts rows without a value last when sorting ascending", () => {
    expect(sortBy(rows, "asc")).toEqual(["zero", "fast", "slow", "none", "nan"]);
  });

  it("puts rows without a value last when sorting descending", () => {
    expect(sortBy(rows, "desc")).toEqual(["slow", "fast", "zero", "none", "nan"]);
  });
});

describe("Utility.formatTurnLength", () => {
  it("says under a minute instead of a blank for very short turns", () => {
    expect(Utility.formatTurnLength(9000)).toBe("under a minute");
  });

  it("stays blank when there are no turns", () => {
    expect(Utility.formatTurnLength(NaN)).toBe("");
    expect(Utility.formatTurnLength(undefined)).toBe("");
  });

  it("formats longer turns as before", () => {
    expect(Utility.formatTurnLength(2 * 60 * 60 * 1000)).toContain("2 hours");
  });
});
